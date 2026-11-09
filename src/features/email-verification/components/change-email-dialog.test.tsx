import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { requestEmailChange, confirmEmailChange } = vi.hoisted(() => ({
  requestEmailChange: vi.fn(),
  confirmEmailChange: vi.fn(),
}));

vi.mock("../api", () => ({
  requestEmailChange,
  confirmEmailChange,
  sendSignupCode: vi.fn(),
  verifySignupCode: vi.fn(),
  getEmailVerificationStatus: vi.fn(),
  requestEmailVerification: vi.fn(),
  confirmEmailVerification: vi.fn(),
}));

import { ChangeEmailDialog } from "./change-email-dialog";

function renderDialog(hasPassword: boolean, onOpenChange = vi.fn()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <ChangeEmailDialog
        open
        onOpenChange={onOpenChange}
        currentEmail="asha@example.com"
        hasPassword={hasPassword}
      />
    </QueryClientProvider>,
  );
  return onOpenChange;
}

describe("ChangeEmailDialog", () => {
  beforeEach(() => {
    requestEmailChange.mockReset();
    confirmEmailChange.mockReset();
    requestEmailChange.mockResolvedValue({
      expires_in: 600,
      resend_after: 60,
      sent_to: "n•••@example.com",
    });
  });

  it("asks for the current password only when the account has one", () => {
    renderDialog(false);
    expect(screen.queryByLabelText("Current password")).not.toBeInTheDocument();
  });

  it("verifies the new address before switching", async () => {
    confirmEmailChange.mockResolvedValue({
      email: "new@example.com",
      verified: true,
    });
    const onOpenChange = renderDialog(true);
    fireEvent.change(screen.getByLabelText("New email"), {
      target: { value: "new@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Current password"), {
      target: { value: "pw-123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send code" }));
    await screen.findByText("n•••@example.com");
    expect(requestEmailChange).toHaveBeenCalledWith(
      "new@example.com",
      "pw-123456",
    );
    fireEvent.change(screen.getByLabelText("6-digit code"), {
      target: { value: "123456" },
    });
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(confirmEmailChange).toHaveBeenCalledWith("123456");
  });
});
