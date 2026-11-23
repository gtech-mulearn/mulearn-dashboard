import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  refetch: vi.fn(),
  query: {
    isLoading: false,
    isError: false,
    error: null as unknown,
    data: undefined as unknown,
  },
}));

vi.mock("../hooks", () => ({
  usePushCampaigns: () => ({ ...mocks.query, refetch: mocks.refetch }),
  usePushCampaignAction: () => ({
    isPending: false,
    variables: undefined,
    mutate: mocks.mutate,
  }),
}));

import { PushCampaignsTable } from "./push-campaigns-table";

const campaign = {
  id: "c1",
  title: "Weekend challenge",
  body: "Join in",
  route: null,
  audience: { type: "all", ids: [] },
  status: "draft",
  scheduled_at: null,
  respect_quiet_hours: true,
  target_count: 4120,
  sent_count: 0,
  skipped_count: 0,
  failed_count: 0,
  created_at: "2026-11-17T10:00:00+00:00",
  sent_at: null,
  created_by: "Fay",
};

describe("PushCampaignsTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.query.isError = false;
    mocks.query.error = null;
    mocks.query.data = [campaign];
  });

  it("asks before sending and only sends on confirm", () => {
    render(<PushCampaignsTable />);
    fireEvent.click(screen.getByRole("button", { name: "Send now" }));
    const dialog = screen.getByTestId("confirm-dialog");
    expect(dialog).toHaveTextContent("Send now?");
    expect(dialog).toHaveTextContent("This goes to 4,120 phones.");
    expect(mocks.mutate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("confirm-dialog-confirm"));
    expect(mocks.mutate).toHaveBeenCalledWith({ id: "c1", action: "send" });
  });

  it("backing out of Send now does nothing", () => {
    render(<PushCampaignsTable />);
    fireEvent.click(screen.getByRole("button", { name: "Send now" }));
    fireEvent.click(screen.getByTestId("confirm-dialog-cancel"));
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it("asks before cancelling and only cancels on confirm", () => {
    render(<PushCampaignsTable />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    const dialog = screen.getByTestId("confirm-dialog");
    expect(dialog).toHaveTextContent("Cancel this campaign?");
    expect(mocks.mutate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("confirm-dialog-confirm"));
    expect(mocks.mutate).toHaveBeenCalledWith({ id: "c1", action: "cancel" });
  });

  it("keeping the campaign does not cancel it", () => {
    render(<PushCampaignsTable />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByTestId("confirm-dialog-cancel"));
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it("shows the backend message with Retry instead of a false empty", () => {
    mocks.query.isError = true;
    mocks.query.data = undefined;
    mocks.query.error = new Error("Role not verified");
    render(<PushCampaignsTable />);
    expect(screen.getByText("Couldn't load push campaigns.")).toBeVisible();
    expect(screen.getByText("Role not verified")).toBeVisible();
    expect(screen.queryByText(/No push campaigns yet/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(mocks.refetch).toHaveBeenCalled();
  });
});
