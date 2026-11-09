import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/errors";
import type { ConnectedApp } from "../schemas";

const api = vi.hoisted(() => ({
  listConnectedApps: vi.fn(),
  getConnectedApp: vi.fn(),
  registerConnectedApp: vi.fn(),
  updateConnectedApp: vi.fn(),
  setConnectedAppEnabled: vi.fn(),
}));
const push = vi.hoisted(() => vi.fn());

vi.mock("../api", () => api);
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/features/sign-in-security", () => ({
  useSecurityPosture: () => ({ data: { issuer: "http://localhost:3001" } }),
}));

import { AppDetailPage } from "./app-detail-page";
import { ConnectedAppsPage } from "./connected-apps-page";
import { RegisterAppPage } from "./register-app-page";

const app = (over: Partial<ConnectedApp> = {}): ConnectedApp => ({
  client_id: "test-app-local",
  name: "Test App (local)",
  client_type: "confidential",
  redirect_uris: ["http://localhost:4000/auth/callback"],
  post_logout_redirect_uris: ["http://localhost:4000/"],
  skip_authorization: false,
  algorithm: "RS256",
  created: "2026-11-07T14:00:00Z",
  updated: "2026-11-07T14:00:00Z",
  disabled_at: null,
  ...over,
});

function renderWithQuery(node: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{node}</QueryClientProvider>,
  );
}

beforeEach(() => {
  for (const fn of Object.values(api)) fn.mockReset();
  push.mockReset();
});

describe("ConnectedAppsPage", () => {
  it("lists every app with its kind and status", async () => {
    api.listConnectedApps.mockResolvedValue([
      app(),
      app({
        client_id: "mulearn-dashboard",
        name: "µLearn dashboard",
        client_type: "public",
        skip_authorization: true,
      }),
      app({
        client_id: "old-app",
        name: "Old app",
        disabled_at: "2026-11-01T10:00:00Z",
      }),
    ]);
    renderWithQuery(<ConnectedAppsPage />);

    const partner = (await screen.findByText("Test App (local)")).closest(
      "tr",
    ) as HTMLElement;
    expect(within(partner).getByText("Partner")).toBeInTheDocument();
    expect(within(partner).getByText("Active")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Test App (local)" }),
    ).toHaveAttribute(
      "href",
      "/dashboard/management/system/applications/test-app-local",
    );
    const firstParty = screen
      .getByText("µLearn dashboard")
      .closest("tr") as HTMLElement;
    expect(within(firstParty).getByText("First-party")).toBeInTheDocument();
    const old = screen.getByText("Old app").closest("tr") as HTMLElement;
    expect(within(old).getByText("Disabled")).toBeInTheDocument();
  });

  it("offers to register the first app when there are none", async () => {
    api.listConnectedApps.mockResolvedValue([]);
    renderWithQuery(<ConnectedAppsPage />);
    expect(
      await screen.findByText("No apps are registered yet"),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /Register app/ })[0],
    ).toHaveAttribute("href", "/dashboard/management/system/applications/new");
  });
});

function fillRegistration() {
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Test App (local)" },
  });
  fireEvent.change(screen.getByLabelText("Client ID"), {
    target: { value: "test-app-local" },
  });
  fireEvent.change(screen.getByLabelText("Redirect URI 1"), {
    target: { value: "http://localhost:4000/auth/callback" },
  });
}

describe("RegisterAppPage", () => {
  it("registers a partner app and shows its secret once", async () => {
    api.registerConnectedApp.mockResolvedValue({
      client: app(),
      client_secret: "s3cret-value",
    });
    renderWithQuery(<RegisterAppPage />);
    fillRegistration();
    fireEvent.click(screen.getByRole("button", { name: "Register app" }));

    await waitFor(() =>
      expect(api.registerConnectedApp).toHaveBeenCalledWith({
        name: "Test App (local)",
        client_id: "test-app-local",
        client_type: "confidential",
        skip_authorization: false,
        redirect_uris: ["http://localhost:4000/auth/callback"],
        post_logout_redirect_uris: [],
      }),
    );
    expect(await screen.findByText("s3cret-value")).toBeInTheDocument();
    expect(
      screen.getByText(/OIDC_CLIENT_SECRET=s3cret-value/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/OIDC_ISSUER=http:\/\/localhost:3001/),
    ).toBeInTheDocument();

    const done = screen.getByRole("button", { name: "Done" });
    expect(done).toBeDisabled();
    fireEvent.click(
      screen.getByLabelText("I've stored the secret somewhere safe"),
    );
    fireEvent.click(done);
    expect(push).toHaveBeenCalledWith(
      "/dashboard/management/system/applications/test-app-local",
    );
  });

  it("a public app gets no secret", async () => {
    api.registerConnectedApp.mockResolvedValue({
      client: app({ client_type: "public" }),
      client_secret: null,
    });
    renderWithQuery(<RegisterAppPage />);
    fillRegistration();
    fireEvent.click(screen.getByLabelText(/Public/));
    fireEvent.click(screen.getByRole("button", { name: "Register app" }));
    expect(await screen.findByText(/no client secret/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Done" })).toBeEnabled();
  });

  it("refuses a bad redirect URI before sending anything", async () => {
    renderWithQuery(<RegisterAppPage />);
    fillRegistration();
    fireEvent.change(screen.getByLabelText("Redirect URI 1"), {
      target: { value: "http://app.example.com/cb" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Register app" }));
    expect(await screen.findByText(/Use https:\/\//)).toBeInTheDocument();
    expect(api.registerConnectedApp).not.toHaveBeenCalled();
  });

  it("puts the server's field errors on the form", async () => {
    api.registerConnectedApp.mockRejectedValue(
      new ApiError(409, "A client with this client_id already exists.", {
        hasError: true,
        message: { general: ["A client with this client_id already exists."] },
        response: {
          error: "conflict",
          fields: {
            client_id: "Already registered. Client ids are never reused.",
          },
        },
      }),
    );
    renderWithQuery(<RegisterAppPage />);
    fillRegistration();
    fireEvent.click(screen.getByRole("button", { name: "Register app" }));
    expect(
      await screen.findByText(
        "Already registered. Client ids are never reused.",
      ),
    ).toBeInTheDocument();
  });
});

describe("AppDetailPage", () => {
  it("saves edits without sending the client id or type", async () => {
    api.getConnectedApp.mockResolvedValue(app());
    api.updateConnectedApp.mockResolvedValue(app({ name: "Test App (dev)" }));
    renderWithQuery(<AppDetailPage clientId="test-app-local" />);
    fireEvent.change(await screen.findByLabelText("Name"), {
      target: { value: "Test App (dev)" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() =>
      expect(api.updateConnectedApp).toHaveBeenCalledWith("test-app-local", {
        name: "Test App (dev)",
        skip_authorization: false,
        redirect_uris: ["http://localhost:4000/auth/callback"],
        post_logout_redirect_uris: ["http://localhost:4000/"],
      }),
    );
  });

  it("disabling needs the client id typed, and records the reason", async () => {
    api.getConnectedApp.mockResolvedValue(app());
    api.setConnectedAppEnabled.mockResolvedValue(
      app({ disabled_at: "2026-11-09T10:00:00Z" }),
    );
    renderWithQuery(<AppDetailPage clientId="test-app-local" />);
    fireEvent.click(await screen.findByRole("button", { name: "Disable app" }));

    const dialog = await screen.findByRole("dialog");
    const confirm = within(dialog).getByRole("button", { name: "Disable app" });
    expect(confirm).toBeDisabled();
    fireEvent.change(
      within(dialog).getByLabelText(/Type test-app-local to confirm/),
      {
        target: { value: "test-app-local" },
      },
    );
    fireEvent.change(within(dialog).getByLabelText(/Reason/), {
      target: { value: "Leaked secret" },
    });
    expect(confirm).toBeEnabled();
    fireEvent.click(confirm);
    await waitFor(() =>
      expect(api.setConnectedAppEnabled).toHaveBeenCalledWith(
        "test-app-local",
        false,
        "Leaked secret",
      ),
    );
  });

  it("a disabled app can be enabled again", async () => {
    api.getConnectedApp.mockResolvedValue(
      app({ disabled_at: "2026-11-01T10:00:00Z" }),
    );
    api.setConnectedAppEnabled.mockResolvedValue(app());
    renderWithQuery(<AppDetailPage clientId="test-app-local" />);
    fireEvent.click(await screen.findByRole("button", { name: "Enable app" }));
    fireEvent.click(await screen.findByRole("button", { name: "Enable" }));
    await waitFor(() =>
      expect(api.setConnectedAppEnabled).toHaveBeenCalledWith(
        "test-app-local",
        true,
        undefined,
      ),
    );
  });

  it("says so when the app doesn't exist", async () => {
    api.getConnectedApp.mockRejectedValue(
      new ApiError(404, "Client not found.", {}),
    );
    renderWithQuery(<AppDetailPage clientId="nope" />);
    expect(
      await screen.findByText("No app with this client ID"),
    ).toBeInTheDocument();
  });
});
