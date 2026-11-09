import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmailCodeForm } from "./email-code-form";

const base = {
  sentTo: "a•••@example.com",
  onSubmit: vi.fn(),
  onResend: vi.fn(),
  resendIn: 0,
};

describe("EmailCodeForm", () => {
  it("names the masked address and submits a complete code automatically", () => {
    const onSubmit = vi.fn();
    render(<EmailCodeForm {...base} onSubmit={onSubmit} />);
    expect(screen.getByText("a•••@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verify" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("6-digit code"), {
      target: { value: "123456" },
    });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith("123456");
  });

  it("shows the error as an alert", () => {
    render(
      <EmailCodeForm {...base} error="That code isn't right. 3 tries left." />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("3 tries left");
  });

  it("holds resend until the countdown ends", () => {
    const onResend = vi.fn();
    const { rerender } = render(
      <EmailCodeForm {...base} onResend={onResend} resendIn={42} />,
    );
    expect(
      screen.getByRole("button", { name: "Resend code in 0:42" }),
    ).toBeDisabled();
    rerender(<EmailCodeForm {...base} onResend={onResend} resendIn={0} />);
    fireEvent.click(screen.getByRole("button", { name: "Resend code" }));
    expect(onResend).toHaveBeenCalledTimes(1);
  });

  it("offers to edit the email when allowed", () => {
    const onEditEmail = vi.fn();
    render(<EmailCodeForm {...base} onEditEmail={onEditEmail} />);
    fireEvent.click(screen.getByRole("button", { name: "Wrong email? Edit" }));
    expect(onEditEmail).toHaveBeenCalled();
  });
});
