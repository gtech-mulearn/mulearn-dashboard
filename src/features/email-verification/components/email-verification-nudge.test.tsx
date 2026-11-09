import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { emailVerificationKeys } from "../hooks/query-keys";

const { getEmailVerificationStatus } = vi.hoisted(() => ({
  getEmailVerificationStatus: vi.fn(),
}));

vi.mock("../api", () => ({
  getEmailVerificationStatus,
  sendSignupCode: vi.fn(),
  verifySignupCode: vi.fn(),
  requestEmailVerification: vi.fn(),
  confirmEmailVerification: vi.fn(),
  requestEmailChange: vi.fn(),
  confirmEmailChange: vi.fn(),
}));

import { EmailVerificationNudge } from "./email-verification-nudge";

const status = (verified: boolean) => ({
  email: "asha@example.com",
  verified,
  verified_at: verified ? "2026-10-12T10:00:00Z" : null,
  via: verified ? "signup" : null,
  has_password: true,
});

function renderNudge() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const view = render(
    <QueryClientProvider client={client}>
      <EmailVerificationNudge />
    </QueryClientProvider>,
  );
  return { ...view, client };
}

describe("EmailVerificationNudge", () => {
  beforeEach(() => getEmailVerificationStatus.mockReset());

  it("asks an unverified user to verify", async () => {
    getEmailVerificationStatus.mockResolvedValue(status(false));
    renderNudge();
    expect(
      await screen.findByText("Your email isn't verified"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verify" })).toBeInTheDocument();
  });

  it("stays out of the way once verified", async () => {
    getEmailVerificationStatus.mockResolvedValue(status(true));
    const { container, client } = renderNudge();
    // Wait until the status has actually loaded, so "empty" means "verified",
    // not "still loading".
    await waitFor(() =>
      expect(client.getQueryState(emailVerificationKeys.status())?.status).toBe(
        "success",
      ),
    );
    expect(container).toBeEmptyDOMElement();
  });
});
