import { describe, expect, it } from "vitest";
import { groupPushStats, groupVariantStats } from "./stats";

describe("groupPushStats", () => {
  it("collapses statuses into one line per source and kind, busiest first", () => {
    const lines = groupPushStats([
      {
        source: "engagement",
        kind: "ENGAGEMENT",
        status: "sent",
        n: 10,
        opened: 4,
      },
      {
        source: "engagement",
        kind: "ENGAGEMENT",
        status: "skipped_quiet",
        n: 3,
        opened: 0,
      },
      {
        source: "engagement",
        kind: "ENGAGEMENT",
        status: "failed",
        n: 1,
        opened: 0,
      },
      {
        source: "activity",
        kind: "KARMA_AWARDED",
        status: "sent",
        n: 25,
        opened: 5,
      },
    ]);
    expect(lines.map((l) => l.kind)).toEqual(["KARMA_AWARDED", "ENGAGEMENT"]);
    expect(lines[1]).toMatchObject({
      sent: 10,
      opened: 4,
      failed: 1,
      skipped: { skipped_quiet: 3 },
    });
  });

  it("is empty for no rows", () => {
    expect(groupPushStats([])).toEqual([]);
  });
});

describe("groupVariantStats", () => {
  it("splits group and key, computes rate, sorts by group then rate", () => {
    const lines = groupVariantStats([
      { variant: "STREAK_RESCUE:b", sent: 10, opened: 2 },
      { variant: "KARMA_AWARDED:a", sent: 4, opened: 1 },
      { variant: "STREAK_RESCUE:a", sent: 10, opened: 5 },
      { variant: "COMEBACK:z", sent: 0, opened: 0 },
    ]);
    expect(lines.map((l) => `${l.group}:${l.key}`)).toEqual([
      "COMEBACK:z",
      "KARMA_AWARDED:a",
      "STREAK_RESCUE:a",
      "STREAK_RESCUE:b",
    ]);
    expect(lines[0].rate).toBe(0);
    expect(lines[2]).toMatchObject({ sent: 10, opened: 5, rate: 0.5 });
  });
});
