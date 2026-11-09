import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { formatDuration, type LoginAttempt } from "../schemas";

const api = vi.hoisted(() => ({
  getSigninPolicy: vi.fn(),
  updateSigninPolicy: vi.fn(),
  getSecurityPosture: vi.fn(),
  getLoginAttempts: vi.fn(),
  revokeMemberSessions: vi.fn(),
  LOGIN_ATTEMPTS_PAGE: 50,
}));
vi.mock("../api", () => api);
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { SignInSecurityPage } from "./sign-in-security-page";

const attempt = (over: Partial<LoginAttempt> = {}): LoginAttempt => ({
  identifier: "asha@example.com",
  status: "Success",
  type: "password",
  succeeded: true,
  ip_address: "10.0.0.1",
  browser: "Chrome",
  os: "Windows",
  device_type: "desktop",
  city: "Kochi",
  country: "India",
  created_at: "2026-11-09T10:00:00Z",
  ...over,
});

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <SignInSecurityPage />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  for (const fn of Object.values(api))
    if (typeof fn === "function") fn.mockReset();
  api.getSigninPolicy.mockResolvedValue({
    policy: { attempts_limit: 5, block_minutes: 30 },
    bounds: { attempts_limit: [3, 20], block_minutes: [1, 1440] },
  });
  api.getSecurityPosture.mockResolvedValue({
    issuer: "http://localhost:3001",
    pkce_required: true,
    localhost_redirects_allowed: true,
    lifetimes_seconds: { access_token: 900, refresh_token: 604800 },
    signing_keys: { active: "kid-123", inactive: [] },
  });
  api.getLoginAttempts.mockResolvedValue({ items: [], next_before: null });
});

describe("SignInSecurityPage", () => {
  it("lists recent sign-ins and loads older ones", async () => {
    api.getLoginAttempts
      .mockResolvedValueOnce({
        items: [attempt()],
        next_before: "2026-11-09T10:00:00Z",
      })
      .mockResolvedValueOnce({
        items: [
          attempt({
            identifier: "ravi@example.com",
            succeeded: false,
            status: "Failure",
          }),
        ],
        next_before: null,
      });
    renderPage();
    expect(await screen.findByText("asha@example.com")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Load older" }));
    const row = (await screen.findByText("ravi@example.com")).closest(
      "tr",
    ) as HTMLElement;
    expect(within(row).getByText("Failed")).toBeInTheDocument();
    expect(api.getLoginAttempts).toHaveBeenLastCalledWith(
      { identifier: "", result: "" },
      "2026-11-09T10:00:00Z",
    );
    expect(
      screen.queryByRole("button", { name: "Load older" }),
    ).not.toBeInTheDocument();
  });

  it("filters by person and result", async () => {
    renderPage();
    await screen.findByText("No sign-ins match");
    fireEvent.change(screen.getByLabelText("Email or µID"), {
      target: { value: "asha@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Failed" }));
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    await waitFor(() =>
      expect(api.getLoginAttempts).toHaveBeenLastCalledWith(
        { identifier: "asha@example.com", result: "failure" },
        undefined,
      ),
    );
  });

  it("keeps policy edits inside the allowed range", async () => {
    api.updateSigninPolicy.mockResolvedValue({
      attempts_limit: 10,
      block_minutes: 30,
    });
    renderPage();
    const attempts = await screen.findByLabelText(
      "Failed attempts before lockout",
    );
    expect(attempts).toHaveValue(5);
    fireEvent.change(attempts, { target: { value: "25" } });
    fireEvent.click(screen.getByRole("button", { name: "Save policy" }));
    expect(await screen.findByText("Between 3 and 20.")).toBeInTheDocument();
    expect(api.updateSigninPolicy).not.toHaveBeenCalled();

    fireEvent.change(attempts, { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "Save policy" }));
    await waitFor(() =>
      expect(api.updateSigninPolicy).toHaveBeenCalledWith({
        attempts_limit: 10,
        block_minutes: 30,
      }),
    );
  });

  it("asks before signing a member out everywhere", async () => {
    api.revokeMemberSessions.mockResolvedValue(
      "MU-1 has been signed out everywhere",
    );
    renderPage();
    fireEvent.change(await screen.findByLabelText("µID"), {
      target: { value: "MU-1" },
    });
    fireEvent.change(screen.getByLabelText(/Reason/), {
      target: { value: "Lost phone" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Sign out everywhere" }),
    );
    expect(api.revokeMemberSessions).not.toHaveBeenCalled();
    fireEvent.click(
      await screen.findByRole("button", { name: "Yes, sign them out" }),
    );
    await waitFor(() =>
      expect(api.revokeMemberSessions).toHaveBeenCalledWith(
        "MU-1",
        "Lost phone",
      ),
    );
  });

  it("shows the identity provider's settings and warns about localhost redirects", async () => {
    renderPage();
    expect(
      await screen.findByText("http://localhost:3001"),
    ).toBeInTheDocument();
    expect(screen.getByText(/development only/i)).toBeInTheDocument();
    expect(screen.getByText("kid-123")).toBeInTheDocument();
  });
});

describe("formatDuration", () => {
  it.each([
    [900, "15 min"],
    [5400, "1 h 30 min"],
    [604800, "7 days"],
    [86400, "1 day"],
    [45, "45 s"],
  ])("%i seconds → %s", (seconds, text) => {
    expect(formatDuration(seconds)).toBe(text);
  });
});
