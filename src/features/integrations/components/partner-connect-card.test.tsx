import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PartnerConnection } from "../schemas";

const api = vi.hoisted(() => ({
  getPartnerConnection: vi.fn(),
  authorizePartner: vi.fn(),
  signInPartner: vi.fn(),
  disconnectPartner: vi.fn(),
}));
vi.mock("../api", () => api);
const { toast } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));
vi.mock("sonner", () => ({ toast }));
vi.mock("@/features/email-verification", () => ({
  EmailVerifyPanel: () => null,
  useEmailVerificationStatus: () => ({
    data: { email: "asha@example.com", verified: true },
  }),
  useCountdown: (seconds = 0) => ({ remaining: seconds, start: vi.fn() }),
  formatCountdown: (seconds: number) => `${seconds}s`,
}));

import { PartnerConnectCard } from "./partner-connect-card";

const LOGIN_URL = "https://newdev.futuremug.com/sso/login/abc";
const activeLink: NonNullable<PartnerConnection["connection"]> = {
  status: "active",
  connected_at: "2026-10-12T10:00:00Z",
  last_login_at: "2026-10-12T10:00:00Z",
  contact_name: "Asha Nair",
  takeover_required: false,
};
const base: PartnerConnection = {
  enabled: true,
  account_type: "candidate",
  hidden: false,
  eligibility: { eligible: true, reason: null, message: null },
  can_manage: true,
  managed_by: null,
  email_verified: true,
  connection: activeLink,
  consent: {
    current_version: "v1",
    accepted_version: "v1",
    needs_consent: false,
    document: null,
  },
  shared_data_preview: [],
};

const consentDocument = {
  version: "fm-2026-10-12",
  title: "Connect Futuremug",
  subtitle: "Run assessments and interviews for your students on Futuremug.",
  purpose: "µLearn shares these details only to create your Futuremug account.",
  sections: [],
  notes: [],
  checkbox_label: "I agree and accept Futuremug's {terms} and {privacy}.",
  terms_url: "https://futuremug.example/terms",
  privacy_url: "https://futuremug.example/privacy",
};
const newCollege: PartnerConnection = {
  ...base,
  account_type: "college",
  connection: null,
  consent: {
    current_version: "fm-2026-10-12",
    accepted_version: null,
    needs_consent: true,
    document: consentDocument,
  },
};
const pendingCollege: PartnerConnection = {
  ...base,
  account_type: "college",
  connection: { ...activeLink, status: "pending_approval" },
};

function renderCard(
  connection: PartnerConnection,
  accountType: "candidate" | "company" | "college" = "candidate",
) {
  api.getPartnerConnection.mockResolvedValue(connection);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <PartnerConnectCard
        provider="futuremug"
        accountType={accountType}
        title="Connected apps"
      />
    </QueryClientProvider>,
  );
}

function fakeTab() {
  return {
    opener: {},
    location: { href: "" },
    close: vi.fn(),
  } as unknown as Window;
}

describe("PartnerConnectCard", () => {
  beforeEach(() => {
    for (const fn of Object.values(api)) fn.mockReset();
    for (const fn of Object.values(toast)) fn.mockReset();
  });
  afterEach(() => vi.restoreAllMocks());

  it("renders nothing when the backend says hidden", async () => {
    const { container } = renderCard({ ...base, hidden: true });
    await waitFor(() => expect(api.getPartnerConnection).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when Futuremug is switched off", async () => {
    const { container } = renderCard({ ...base, enabled: false });
    await waitFor(() => expect(api.getPartnerConnection).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it("shows nothing, not even a placeholder, until it knows the card applies", async () => {
    // Most people never see this card, and with Futuremug switched off nobody
    // does, so a loading placeholder would flash a Futuremug slot at everyone.
    api.getPartnerConnection.mockReturnValue(new Promise(() => {}));
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { container } = render(
      <QueryClientProvider client={client}>
        <PartnerConnectCard
          provider="futuremug"
          accountType="candidate"
          title="Connected apps"
        />
      </QueryClientProvider>,
    );
    await waitFor(() => expect(api.getPartnerConnection).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it("opens Futuremug in the tab opened by the click", async () => {
    const tab = fakeTab();
    vi.spyOn(window, "open").mockReturnValue(tab);
    api.signInPartner.mockResolvedValue({
      status: "login",
      login_url: LOGIN_URL,
      expires_in: 120,
    });
    renderCard(base);
    fireEvent.click(
      await screen.findByRole("button", { name: /Open Futuremug/ }),
    );
    await waitFor(() => expect(tab.location.href).toBe(LOGIN_URL));
    expect(tab.opener).toBeNull();
  });

  it("falls back to a Continue link when the tab is blocked", async () => {
    vi.spyOn(window, "open").mockReturnValue(null);
    api.signInPartner.mockResolvedValue({
      status: "login",
      login_url: LOGIN_URL,
      expires_in: 120,
    });
    renderCard(base);
    fireEvent.click(
      await screen.findByRole("button", { name: /Open Futuremug/ }),
    );
    expect(
      await screen.findByRole("link", { name: /Continue to Futuremug/ }),
    ).toHaveAttribute("href", LOGIN_URL);
  });

  it("disables actions while a launch runs", async () => {
    vi.spyOn(window, "open").mockReturnValue(fakeTab());
    api.signInPartner.mockReturnValue(new Promise(() => {}));
    renderCard(base);
    const open = await screen.findByRole("button", { name: /Open Futuremug/ });
    fireEvent.click(open);
    await waitFor(() => expect(open).toBeDisabled());
    fireEvent.click(open);
    expect(api.signInPartner).toHaveBeenCalledTimes(1);
  });

  it("requests a fresh link on every click", async () => {
    vi.spyOn(window, "open").mockImplementation(() => fakeTab());
    api.signInPartner.mockResolvedValue({
      status: "login",
      login_url: LOGIN_URL,
      expires_in: 120,
    });
    renderCard(base);
    const open = await screen.findByRole("button", { name: /Open Futuremug/ });
    fireEvent.click(open);
    await waitFor(() => expect(open).toBeEnabled());
    fireEvent.click(open);
    await waitFor(() => expect(api.signInPartner).toHaveBeenCalledTimes(2));
  });

  it("checks a pending approval without opening a tab, and says so", async () => {
    const open = vi.spyOn(window, "open");
    api.signInPartner.mockResolvedValue({
      status: "pending_approval",
      pending_url: "https://newdev.futuremug.com/sso/pending/college",
      message: "The account is awaiting approval by the futuremug team.",
    });
    renderCard(pendingCollege, "college");
    fireEvent.click(
      await screen.findByRole("button", { name: "Check status" }),
    );
    expect(
      await screen.findByRole("link", { name: /View on Futuremug/ }),
    ).toHaveAttribute(
      "href",
      "https://newdev.futuremug.com/sso/pending/college",
    );
    expect(toast.info).toHaveBeenCalledWith(
      "Still awaiting Futuremug approval.",
    );
    expect(open).not.toHaveBeenCalled();
    // Our copy only: the partner's own wording isn't shown.
    expect(screen.queryByText(/futuremug team/)).not.toBeInTheDocument();
  });

  it("says a pending approval once", async () => {
    renderCard(pendingCollege, "college");
    await screen.findByRole("button", { name: "Check status" });
    expect(screen.getAllByText(/awaiting/i)).toHaveLength(1);
  });

  it("offers the sign-in link when Check status finds it approved", async () => {
    const open = vi.spyOn(window, "open");
    api.signInPartner.mockResolvedValue({
      status: "login",
      login_url: LOGIN_URL,
      expires_in: 120,
    });
    renderCard(pendingCollege, "college");
    fireEvent.click(
      await screen.findByRole("button", { name: "Check status" }),
    );
    expect(
      await screen.findByRole("link", { name: /Continue to Futuremug/ }),
    ).toHaveAttribute("href", LOGIN_URL);
    expect(open).not.toHaveBeenCalled();
  });

  // Futuremug reviews colleges first: a pre-opened tab would only flash and close.
  it("never opens a tab when a college authorizes, and confirms the request", async () => {
    const open = vi.spyOn(window, "open");
    api.authorizePartner.mockResolvedValue({
      status: "pending_approval",
      pending_url: "https://newdev.futuremug.com/sso/pending/college",
    });
    renderCard(newCollege, "college");
    fireEvent.click(await screen.findByRole("button", { name: "Connect" }));
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(
      screen.getByRole("button", { name: "Authorize & connect" }),
    );
    expect(
      await screen.findByRole("heading", {
        name: "Sent to Futuremug for review",
      }),
    ).toBeInTheDocument();
    expect(api.authorizePartner).toHaveBeenCalledWith(
      "futuremug",
      "college",
      "fm-2026-10-12",
    );
    expect(open).not.toHaveBeenCalled();
  });

  it("is read-only for someone who doesn't manage the account", async () => {
    renderCard({
      ...base,
      can_manage: false,
      managed_by: "Ravi Menon",
      eligibility: {
        eligible: false,
        reason: "not_lead_enabler",
        message: "Managed by your college's Lead Enabler.",
      },
    });
    expect(
      await screen.findByText(/Managed by Ravi Menon/),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  // Withdrawing must be as easy as consenting (spec B §7): whatever the card
  // asks for next, a live link can always be disconnected.
  it.each<[string, PartnerConnection]>([
    [
      "the terms were updated",
      {
        ...base,
        consent: {
          current_version: "v2",
          accepted_version: "v1",
          needs_consent: true,
          document: null,
        },
      },
    ],
    [
      "a takeover is pending",
      { ...base, connection: { ...activeLink, takeover_required: true } },
    ],
    [
      "the account can't connect right now",
      {
        ...base,
        eligibility: {
          eligible: false,
          reason: "email_not_supported",
          message: "Change your email to connect.",
        },
      },
    ],
  ])("keeps Disconnect reachable when %s", async (_label, connection) => {
    renderCard(connection);
    expect(
      await screen.findByRole("button", { name: "Futuremug options" }),
    ).toBeInTheDocument();
  });

  it("locks the options menu while a launch runs", async () => {
    vi.spyOn(window, "open").mockReturnValue(fakeTab());
    api.signInPartner.mockReturnValue(new Promise(() => {}));
    renderCard(base);
    fireEvent.click(
      await screen.findByRole("button", { name: /Open Futuremug/ }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Futuremug options" }),
      ).toBeDisabled(),
    );
  });
});
