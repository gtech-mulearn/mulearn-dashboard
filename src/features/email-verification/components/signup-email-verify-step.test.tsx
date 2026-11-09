import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/errors";

const { sendSignupCode, verifySignupCode } = vi.hoisted(() => ({
  sendSignupCode: vi.fn(),
  verifySignupCode: vi.fn(),
}));

vi.mock("../api", () => ({
  sendSignupCode,
  verifySignupCode,
  getEmailVerificationStatus: vi.fn(),
  requestEmailVerification: vi.fn(),
  confirmEmailVerification: vi.fn(),
  requestEmailChange: vi.fn(),
  confirmEmailChange: vi.fn(),
}));

import { SignupEmailVerifyStep } from "./signup-email-verify-step";

const failure = (status: number, code: string, response = {}) =>
  new ApiError(status, "server message", {
    message: { general: ["server message"], error_code: code },
    response,
  });

function renderStep(
  props: Partial<Parameters<typeof SignupEmailVerifyStep>[0]> = {},
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const onVerified = vi.fn();
  const onEditEmail = vi.fn();
  render(
    <StrictMode>
      <QueryClientProvider client={client}>
        <SignupEmailVerifyStep
          email="asha@example.com"
          onVerified={onVerified}
          onEditEmail={onEditEmail}
          {...props}
        />
      </QueryClientProvider>
    </StrictMode>,
  );
  return { onVerified, onEditEmail };
}

describe("SignupEmailVerifyStep", () => {
  beforeEach(() => {
    sendSignupCode.mockReset();
    verifySignupCode.mockReset();
    sendSignupCode.mockResolvedValue({
      expires_in: 600,
      resend_after: 60,
      sent_to: "a•••@example.com",
    });
  });

  it("sends exactly one code under StrictMode", async () => {
    renderStep();
    expect(await screen.findByText("a•••@example.com")).toBeInTheDocument();
    expect(sendSignupCode).toHaveBeenCalledTimes(1);
    expect(sendSignupCode).toHaveBeenCalledWith("asha@example.com");
  });

  it("hands the token to the signup on a correct code", async () => {
    verifySignupCode.mockResolvedValue({
      email_verification_token: "tok",
      expires_in: 3600,
    });
    const { onVerified } = renderStep();
    await screen.findByText("a•••@example.com");
    fireEvent.change(screen.getByLabelText("6-digit code"), {
      target: { value: "123456" },
    });
    await waitFor(() => expect(onVerified).toHaveBeenCalledWith("tok"));
    expect(verifySignupCode).toHaveBeenCalledWith("asha@example.com", "123456");
  });

  it("says how many tries are left after a wrong code", async () => {
    verifySignupCode.mockRejectedValue(
      failure(400, "invalid_code", { attempts_left: 3 }),
    );
    renderStep();
    await screen.findByText("a•••@example.com");
    fireEvent.change(screen.getByLabelText("6-digit code"), {
      target: { value: "000000" },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That code isn't right. 3 tries left.",
    );
  });

  it("points an existing account to sign-in", async () => {
    sendSignupCode.mockRejectedValue(failure(409, "email_taken"));
    const { onEditEmail } = renderStep();
    const signIn = await screen.findByRole("link", { name: "Sign in" });
    expect(signIn).toHaveAttribute("href", "/login");
    fireEvent.click(
      screen.getByRole("button", { name: "Use a different email" }),
    );
    expect(onEditEmail).toHaveBeenCalled();
  });
});
