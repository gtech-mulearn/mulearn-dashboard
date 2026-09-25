import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { buildColumnOrder } from "./manage-companies-table";

const noop = () => {};
const requested = buildColumnOrder(noop, noop, noop).find(
  (c) => c.column === "verification_requested_at",
);

// Table hands wrap() an already en-US-formatted value (convertToTableData),
// so the cell must format from the raw row value to match the other tabs.
const renderCell = (raw: string | null) =>
  render(
    <div>
      {requested?.wrap?.("Sep 25, 2026", "c1", {
        verification_requested_at: raw,
      })}
    </div>,
  ).container.textContent;

describe("Company tab — Requested column", () => {
  it("uses the same short date as the other verification tabs", () => {
    expect(renderCell("2026-09-25T12:00:00Z")).toMatch(/^25 Sept? 2026$/);
  });

  it("shows an em dash when the company never requested verification", () => {
    expect(renderCell(null)).toBe("—");
  });
});

// Row actions use the Mentor tab's icon buttons (RowActionButton).
describe("Company tab — row actions", () => {
  const renderActions = (status: string) => {
    const handlers = { onView: vi.fn(), onApprove: vi.fn(), onReject: vi.fn() };
    const actions = buildColumnOrder(
      handlers.onView,
      handlers.onApprove,
      handlers.onReject,
    ).find((c) => c.column === "id");
    render(<div>{actions?.wrap?.("", "c1", { status })}</div>);
    return handlers;
  };

  it("offers View, Approve and Reject on a pending company", () => {
    const handlers = renderActions("pending");
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(handlers.onView).toHaveBeenCalledWith("c1");
    expect(handlers.onApprove).toHaveBeenCalledWith("c1");
    expect(handlers.onReject).toHaveBeenCalledWith("c1");
  });

  it("only offers View once a company is decided", () => {
    renderActions("verified");
    expect(screen.getByRole("button", { name: "View" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Approve" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Reject" })).toBeNull();
  });
});
