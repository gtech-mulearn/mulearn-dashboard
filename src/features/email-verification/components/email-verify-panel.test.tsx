import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { requestEmailVerification, confirmEmailVerification } = vi.hoisted(
  () => ({
    requestEmailVerification: vi.fn(),
    confirmEmailVerification: vi.fn(),
  }),
);

vi.mock("../api", () => ({
  requestEmailVerification,
  confirmEmailVerification,
  sendSignupCode: vi.fn(),
  verifySignupCode: vi.fn(),
  getEmailVerificationStatus: vi.fn(),
  requestEmailChange: vi.fn(),
  confirmEmailChange: vi.fn(),
}));

import { EmailVerifyPanel } from "./email-verify-panel";

function renderPanel(onVerified = vi.fn()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <EmailVerifyPanel email="asha@example.com" onVerified={onVerified} />
    </QueryClientProvider>,
  );
  return onVerified;
}

describe("EmailVerifyPanel", () => {
  beforeEach(() => {
    requestEmailVerification.mockReset();
    confirmEmailVerification.mockReset();
  });

  it("sends a code on request, then verifies it", async () => {
    requestEmailVerification.mockResolvedValue({
      expires_in: 600,
      resend_after: 60,
      sent_to: "a•••@example.com",
    });
    confirmEmailVerification.mockResolvedValue({
      verified: true,
      verified_at: "2026-10-12T10:00:00Z",
    });
    const onVerified = renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "Send code" }));
    await screen.findByText("a•••@example.com");
    fireEvent.change(screen.getByLabelText("6-digit code"), {
      target: { value: "123456" },
    });
    await waitFor(() => expect(onVerified).toHaveBeenCalled());
    expect(confirmEmailVerification).toHaveBeenCalledWith("123456");
  });

  it("treats an already-verified email as done", async () => {
    requestEmailVerification.mockResolvedValue({ already_verified: true });
    const onVerified = renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "Send code" }));
    await waitFor(() => expect(onVerified).toHaveBeenCalled());
  });
});
