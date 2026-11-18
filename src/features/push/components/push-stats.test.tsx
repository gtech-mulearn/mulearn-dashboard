import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  query: {
    isLoading: false,
    data: undefined as unknown,
  },
}));

vi.mock("../hooks", () => ({
  usePushStats: () => mocks.query,
}));

import { PushStatsView } from "./push-stats";

describe("PushStatsView versions table", () => {
  it("shows the opened count and rate, or a dash when nothing was sent", () => {
    mocks.query.data = {
      days: 14,
      devices: { users: 10, devices: 12 },
      rows: [],
      variants: [
        { variant: "STREAK_RESCUE:a", sent: 10, opened: 4 },
        { variant: "COMEBACK:z", sent: 0, opened: 0 },
      ],
    };
    render(<PushStatsView />);
    const rowA = screen.getByText("a").closest("tr");
    expect(rowA).not.toBeNull();
    if (!rowA) return;
    expect(within(rowA).getByText("4 opened · 40%")).toBeInTheDocument();
    const rowZ = screen.getByText("z").closest("tr");
    expect(rowZ).not.toBeNull();
    if (!rowZ) return;
    expect(within(rowZ).getByText("–")).toBeInTheDocument();
  });
});
