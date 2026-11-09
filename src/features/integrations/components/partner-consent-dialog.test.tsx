import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PartnerConnection } from "../schemas";

const { emailStatus } = vi.hoisted(() => ({
  emailStatus: { current: { email: "asha@example.com", verified: true } },
}));

vi.mock("@/features/email-verification", () => ({
  EmailVerifyPanel: () => <div>verify-panel</div>,
  useEmailVerificationStatus: () => ({ data: emailStatus.current }),
  useCountdown: () => ({ remaining: 60, start: vi.fn() }),
  formatCountdown: (seconds: number) => `0:${seconds}`,
}));

import type { LaunchState } from "../hooks/use-partner-launch";
import { PARTNERS } from "../providers";
import { PartnerConsentDialog } from "./partner-consent-dialog";

const connection: PartnerConnection = {
  enabled: true,
  account_type: "college",
  hidden: false,
  eligibility: { eligible: true, reason: null, message: null },
  can_manage: true,
  managed_by: null,
  email_verified: true,
  connection: null,
  consent: {
    current_version: "fm-2026-10-12",
    accepted_version: null,
    needs_consent: true,
    document: {
      version: "fm-2026-10-12",
      title: "Connect Futuremug",
      subtitle:
        "Run assessments and interviews for your students on Futuremug.",
      purpose:
        "µLearn shares these details only to create your Futuremug account.",
      sections: [
        {
          title: "Disconnecting and your rights",
          body: "You can disconnect at any time.",
        },
      ],
      notes: ["Futuremug reviews new company and college accounts."],
      checkbox_label:
        "I agree to share these details with Futuremug and accept Futuremug's {terms} and {privacy}. I can disconnect anytime.",
      terms_url: "https://futuremug.example/terms",
      privacy_url: "https://futuremug.example/privacy",
    },
  },
  shared_data_preview: [
    { label: "College name", value: "St Xavier's College", note: null },
    { label: "Phone", value: "Not shared", note: "Not on your profile" },
  ],
};

function renderDialog({
  onAuthorize = vi.fn(),
  onOpenChange = vi.fn(),
  launchState = { phase: "idle" } as LaunchState,
  opensPartner = true,
} = {}) {
  const client = new QueryClient();
  render(
    <QueryClientProvider client={client}>
      <PartnerConsentDialog
        open
        onOpenChange={onOpenChange}
        meta={PARTNERS.futuremug}
        connection={connection}
        launchState={launchState}
        opensPartner={opensPartner}
        onAuthorize={onAuthorize}
      />
    </QueryClientProvider>,
  );
  return { onAuthorize, onOpenChange };
}

describe("PartnerConsentDialog", () => {
  it("shows exactly what will be shared, the purpose and the notes", () => {
    renderDialog();
    expect(screen.getByText("St Xavier's College")).toBeInTheDocument();
    expect(screen.getByText("Not on your profile")).toBeInTheDocument();
    expect(
      screen.getByText(/only to create your Futuremug account/),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Futuremug reviews new company and college accounts."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Disconnecting and your rights"),
    ).toBeInTheDocument();
  });

  it("links the partner's terms and privacy policy from the consent sentence", () => {
    renderDialog();
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute(
      "href",
      "https://futuremug.example/terms",
    );
    expect(
      screen.getByRole("link", { name: "Privacy Policy" }),
    ).toHaveAttribute("href", "https://futuremug.example/privacy");
  });

  it("authorizes only after the box is ticked", () => {
    const { onAuthorize } = renderDialog();
    const authorize = screen.getByRole("button", {
      name: /Authorize & open Futuremug/,
    });
    expect(authorize).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox"));
    expect(authorize).toBeEnabled();
    fireEvent.click(authorize);
    expect(onAuthorize).toHaveBeenCalledWith("fm-2026-10-12");
  });

  it("asks for email verification first, with the box disabled", () => {
    emailStatus.current = { email: "asha@example.com", verified: false };
    renderDialog();
    expect(
      screen.getByText("Verify your email to continue"),
    ).toBeInTheDocument();
    expect(screen.getByText("verify-panel")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeDisabled();
    emailStatus.current = { email: "asha@example.com", verified: true };
  });

  // Futuremug reviews companies and colleges first, so the button can't
  // promise to open it.
  it("says connect, not open, for accounts the partner reviews first", () => {
    renderDialog({ opensPartner: false });
    expect(
      screen.getByRole("button", { name: "Authorize & connect" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /open Futuremug/ }),
    ).not.toBeInTheDocument();
  });

  // Consent is saved once the partner answers; asking again would re-send it.
  it("replaces the form with what happens next once approval is pending", () => {
    const { onOpenChange } = renderDialog({
      launchState: {
        phase: "pending",
        pendingUrl: "https://newdev.futuremug.com/sso/pending/college",
      },
    });
    expect(
      screen.getByRole("heading", { name: "Sent to Futuremug for review" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Authorize/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /View on Futuremug/ }),
    ).toHaveAttribute(
      "href",
      "https://newdev.futuremug.com/sso/pending/college",
    );
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("offers the ready link, not another authorize, when no tab opened", () => {
    renderDialog({
      launchState: {
        phase: "ready",
        url: "https://newdev.futuremug.com/sso/login/abc",
        expiresIn: 120,
        blocked: false,
      },
    });
    expect(
      screen.getByRole("link", { name: /Continue to Futuremug/ }),
    ).toHaveAttribute("href", "https://newdev.futuremug.com/sso/login/abc");
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Authorize/ }),
    ).not.toBeInTheDocument();
  });
});
