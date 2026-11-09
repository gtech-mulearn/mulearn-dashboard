import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/errors";
import { LaunchStatus } from "./launch-status";

describe("LaunchStatus", () => {
  // The card row and the consent dialog say "pending" once; this must not repeat it.
  it("leaves a pending approval to the card and the dialog", () => {
    const { container } = render(
      <LaunchStatus
        partnerName="Futuremug"
        state={{
          phase: "pending",
          pendingUrl: "https://newdev.futuremug.com/sso/pending/company",
        }}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("offers the link itself when the browser blocked the tab", () => {
    const onContinue = vi.fn();
    render(
      <LaunchStatus
        partnerName="Futuremug"
        state={{
          phase: "ready",
          url: "https://newdev.futuremug.com/sso/login/abc",
          expiresIn: 120,
          blocked: true,
        }}
        onContinue={onContinue}
      />,
    );
    expect(
      screen.getByText(/Your browser blocked the new tab/),
    ).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /Continue to Futuremug/ });
    expect(link).toHaveAttribute(
      "href",
      "https://newdev.futuremug.com/sso/login/abc",
    );
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    fireEvent.click(link);
    expect(onContinue).toHaveBeenCalled();
  });

  it("doesn't blame the browser when no tab was opened", () => {
    render(
      <LaunchStatus
        partnerName="Futuremug"
        state={{
          phase: "ready",
          url: "https://newdev.futuremug.com/sso/login/abc",
          expiresIn: 120,
          blocked: false,
        }}
      />,
    );
    expect(screen.getByText(/Futuremug is ready/)).toBeInTheDocument();
    expect(screen.queryByText(/blocked/)).not.toBeInTheDocument();
  });

  it("shows the server's message for errors", () => {
    const error = new ApiError(429, "busy", {
      message: {
        general: ["Futuremug is busy right now. Try again in a minute."],
        error_code: "partner_busy",
      },
    });
    render(
      <LaunchStatus
        partnerName="Futuremug"
        state={{ phase: "error", error }}
        onRetry={vi.fn()}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Futuremug is busy right now.",
    );
  });
});
