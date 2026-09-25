import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
