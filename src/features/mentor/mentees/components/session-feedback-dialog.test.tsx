import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { submitSessionFeedback } = vi.hoisted(() => ({
  submitSessionFeedback: vi.fn(),
}));
vi.mock("../api/mentees.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/mentees.api")>()),
  submitSessionFeedback,
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import { SessionFeedbackDialog } from "./session-feedback-dialog";

function renderDialog() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  render(
    <SessionFeedbackDialog
      open
      onOpenChange={vi.fn()}
      sessionId="s1"
      sessionTitle="Resume review"
    />,
    { wrapper },
  );
}

const submitButton = () =>
  screen.getByRole("button", { name: /submit feedback/i });

describe("SessionFeedbackDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    submitSessionFeedback.mockResolvedValue(undefined);
  });

  it("stays disabled until there is a rating or a comment", () => {
    renderDialog();
    expect(submitButton()).toBeDisabled();
  });

  it("sends just the rating", async () => {
    renderDialog();
    fireEvent.click(screen.getByRole("radio", { name: "5 stars" }));
    fireEvent.click(submitButton());
    await waitFor(() =>
      expect(submitSessionFeedback).toHaveBeenCalledWith("s1", { rating: 5 }),
    );
  });

  it("sends just the comment", async () => {
    renderDialog();
    fireEvent.change(screen.getByLabelText(/your feedback/i), {
      target: { value: "Great" },
    });
    fireEvent.click(submitButton());
    await waitFor(() =>
      expect(submitSessionFeedback).toHaveBeenCalledWith("s1", {
        feedback: "Great",
      }),
    );
  });
});
