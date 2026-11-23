import { describe, expect, it } from "vitest";
import { groupPushStats } from "./stats";

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
