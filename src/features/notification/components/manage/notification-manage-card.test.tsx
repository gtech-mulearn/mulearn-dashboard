import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAllBroadcasts: vi.fn(),
  deleteAllBroadcasts: vi.fn(),
  deleteBroadcast: vi.fn(),
}));

vi.mock("@/features/notification/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/notification/api")>()),
  getAllBroadcasts: mocks.getAllBroadcasts,
  deleteAllBroadcasts: mocks.deleteAllBroadcasts,
  deleteBroadcast: mocks.deleteBroadcast,
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import { NotificationManageCard } from "./notification-manage-card";

const broadcast = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  title: `Title ${id}`,
  description: `Description ${id}`,
  target_type: "global",
  target_details: { type: "global", name: "Everyone" },
  created_by_name: "Fellow Fay",
  expires_at: "2026-12-31T00:00:00Z",
  ...extra,
});

function renderCard(items: unknown[]) {
  mocks.getAllBroadcasts.mockResolvedValue(items);
  mocks.deleteAllBroadcasts.mockResolvedValue(undefined);
  mocks.deleteBroadcast.mockResolvedValue(undefined);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <NotificationManageCard />
    </QueryClientProvider>,
  );
}

describe("NotificationManageCard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("asks before deleting all, naming the count", async () => {
    renderCard([broadcast("1"), broadcast("2"), broadcast("3")]);
    fireEvent.click(await screen.findByRole("button", { name: /delete all/i }));
    const dialog = await screen.findByTestId("confirm-dialog");
    expect(dialog).toHaveTextContent("Delete all 3 announcements?");
    expect(dialog).toHaveTextContent(
      "This includes ones the system created for learning circles, projects and events.",
    );
    expect(mocks.deleteAllBroadcasts).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("confirm-dialog-confirm"));
    await waitFor(() =>
      expect(mocks.deleteAllBroadcasts).toHaveBeenCalledTimes(1),
    );
  });

  it("cancel keeps everything", async () => {
    renderCard([broadcast("1"), broadcast("2"), broadcast("3")]);
    fireEvent.click(await screen.findByRole("button", { name: /delete all/i }));
    await screen.findByTestId("confirm-dialog");
    fireEvent.click(screen.getByTestId("confirm-dialog-cancel"));
    await waitFor(() =>
      expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument(),
    );
    expect(mocks.deleteAllBroadcasts).not.toHaveBeenCalled();
  });

  it("shows the source label", async () => {
    renderCard([broadcast("1", { source: "learning_circle" })]);
    expect(await screen.findByText("Learning circle")).toBeInTheDocument();
  });

  it("shows the source label under the title, at every width", async () => {
    renderCard([broadcast("1", { source: "learning_circle" })]);
    const label = await screen.findByText("Learning circle");
    const cell = label.closest("td");
    expect(cell).toHaveTextContent("Title 1");
    expect(cell?.className).not.toContain("hidden");
    expect(label.closest("th, td")?.className ?? "").not.toContain("lg:");
  });

  it("asks before deleting one announcement", async () => {
    renderCard([broadcast("1"), broadcast("2")]);
    const buttons = await screen.findAllByRole("button", {
      name: "Delete announcement",
    });
    fireEvent.click(buttons[0]);
    const dialog = await screen.findByTestId("confirm-dialog");
    expect(dialog).toHaveTextContent("Delete this announcement?");
    expect(mocks.deleteBroadcast).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("confirm-dialog-confirm"));
    await waitFor(() => expect(mocks.deleteBroadcast).toHaveBeenCalledTimes(1));
    expect(mocks.deleteBroadcast.mock.calls[0][0]).toBe("1");
  });

  it("cancelling the single delete keeps the announcement", async () => {
    renderCard([broadcast("1"), broadcast("2")]);
    const buttons = await screen.findAllByRole("button", {
      name: "Delete announcement",
    });
    fireEvent.click(buttons[0]);
    await screen.findByTestId("confirm-dialog");
    fireEvent.click(screen.getByTestId("confirm-dialog-cancel"));
    await waitFor(() =>
      expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument(),
    );
    expect(mocks.deleteBroadcast).not.toHaveBeenCalled();
  });

  it("uses the singular when one announcement is left", async () => {
    renderCard([broadcast("1")]);
    fireEvent.click(await screen.findByRole("button", { name: /delete all/i }));
    expect(await screen.findByTestId("confirm-dialog")).toHaveTextContent(
      "Delete all 1 announcement?",
    );
  });

  it("shows the backend message with Retry when the list fails", async () => {
    mocks.getAllBroadcasts.mockRejectedValue(new Error("Role not verified"));
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={client}>
        <NotificationManageCard />
      </QueryClientProvider>,
    );
    expect(await screen.findByText("Role not verified")).toBeInTheDocument();
    expect(screen.queryByText(/No active announcements/)).toBeNull();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
