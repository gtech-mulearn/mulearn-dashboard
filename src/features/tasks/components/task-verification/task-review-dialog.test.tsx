import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { reviewTask } = vi.hoisted(() => ({ reviewTask: vi.fn() }));
vi.mock("../../api/task-verification.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../api/task-verification.api")>()),
  reviewTask,
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import { TaskReviewDialog } from "./task-review-dialog";

const task = {
  id: "t1",
  title: "Build a CLI",
  hashtag: "#cli",
  karma: 200,
  approval_status: "pending" as const,
};

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { mutations: { retry: false } } })
      }
    >
      {children}
    </QueryClientProvider>
  );
}

describe("TaskReviewDialog — request changes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("needs a reason, then sends request_changes with it", async () => {
    reviewTask.mockResolvedValue(undefined);
    render(
      <TaskReviewDialog
        task={task}
        action="request_changes"
        open
        onOpenChange={vi.fn()}
      />,
      { wrapper },
    );

    fireEvent.click(screen.getByRole("button", { name: "Request Changes" }));
    expect(
      await screen.findByText("Add a reason so the requester knows why."),
    ).toBeInTheDocument();
    expect(reviewTask).not.toHaveBeenCalled();

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "  Lower the karma " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Request Changes" }));
    await waitFor(() =>
      expect(reviewTask).toHaveBeenCalledWith("t1", {
        action: "request_changes",
        reason: "Lower the karma",
      }),
    );
  });
});
