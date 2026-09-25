import { describe, expect, it } from "vitest";
import { formatShortDate } from "./datetime";

describe("formatShortDate", () => {
  it("formats an ISO instant as day, short month, year", () => {
    // Midday UTC so no runner timezone can shift the calendar day.
    expect(formatShortDate("2026-09-25T12:00:00Z")).toMatch(/^25 Sept? 2026$/);
  });

  it.each([null, undefined, ""])("renders %j as an em dash", (value) => {
    expect(formatShortDate(value)).toBe("—");
  });

  it("renders an unparseable value as an em dash, not Invalid Date", () => {
    expect(formatShortDate("not-a-date")).toBe("—");
  });
});
