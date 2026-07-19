import { describe, expect, it } from "vitest";
import type { InterestGroup } from "../schemas";
import { buildKarmaBreakdown, OTHER_LABEL } from "./karma.utils";

function ig(name: string, karma?: number): InterestGroup {
  return { name, karma, level: { unit: "level", count: 1 } };
}

/** Real payload for awindasr@mulearn: wallet karma 39,246, one IG with karma. */
const LIVE_KARMA = 39246;
const LIVE_IGS = [
  ig("Mobile Development", 0),
  ig("Digital Marketing", 0),
  ig("Web Development", 11000),
];

describe("buildKarmaBreakdown", () => {
  it("totals to wallet karma, not an inflated sum", () => {
    const { total } = buildKarmaBreakdown(LIVE_KARMA, LIVE_IGS);

    expect(total).toBe(LIVE_KARMA);
  });

  it("slices always add up to the total", () => {
    const { slices, total } = buildKarmaBreakdown(LIVE_KARMA, LIVE_IGS);

    expect(slices.reduce((sum, s) => sum + s.value, 0)).toBe(total);
  });

  it("shows each IG with karma, plus the unattributed remainder", () => {
    const { slices } = buildKarmaBreakdown(LIVE_KARMA, LIVE_IGS);

    expect(slices).toEqual([
      { name: "Web Development", value: 11000 },
      { name: OTHER_LABEL, value: 28246 },
    ]);
  });

  it("omits IGs with no karma", () => {
    const { slices } = buildKarmaBreakdown(LIVE_KARMA, LIVE_IGS);

    expect(slices.map((s) => s.name)).not.toContain("Mobile Development");
    expect(slices.map((s) => s.name)).not.toContain("Digital Marketing");
  });

  it("orders IGs largest first", () => {
    const { slices } = buildKarmaBreakdown(600, [
      ig("Small", 100),
      ig("Big", 400),
      ig("Mid", 100),
    ]);

    expect(slices.slice(0, 3).map((s) => s.value)).toEqual([400, 100, 100]);
  });

  it("folds IGs beyond the cap into the remainder without losing karma", () => {
    const igs = [
      ig("A", 60),
      ig("B", 50),
      ig("C", 40),
      ig("D", 30),
      ig("E", 20),
      ig("F", 10),
    ];
    const { slices, total } = buildKarmaBreakdown(300, igs, 5);

    expect(slices).toHaveLength(6); // 5 IGs + remainder
    expect(slices.at(-1)).toEqual({ name: OTHER_LABEL, value: 100 });
    expect(slices.reduce((sum, s) => sum + s.value, 0)).toBe(total);
  });

  it("emits no remainder when IGs account for everything", () => {
    const { slices } = buildKarmaBreakdown(100, [ig("Only", 100)]);

    expect(slices).toEqual([{ name: "Only", value: 100 }]);
  });

  it("never produces a negative remainder when wallet karma lags the IG sum", () => {
    const { slices, total } = buildKarmaBreakdown(50, [ig("Ahead", 200)]);

    expect(total).toBe(200);
    expect(slices.every((s) => s.value > 0)).toBe(true);
  });

  it("handles a user with no karma and no IGs", () => {
    const { slices, total } = buildKarmaBreakdown(0, []);

    expect(slices).toEqual([]);
    expect(total).toBe(0);
  });

  it("shows a lone remainder when no IG has karma", () => {
    const { slices } = buildKarmaBreakdown(500, [ig("None", 0)]);

    expect(slices).toEqual([{ name: OTHER_LABEL, value: 500 }]);
  });
});
