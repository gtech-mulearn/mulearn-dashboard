import { describe, expect, it } from "vitest";
import type { UserLogData } from "../schemas";
import {
  buildHeatmapData,
  HEATMAP_WEEKS,
  parseLogDate,
  toDateKey,
} from "./activity.utils";

/** Mimic the API's DRF CharField output: Python str(datetime), space-separated. */
function drfStamp(date: Date): string {
  return `${date.toISOString().slice(0, 19).replace("T", " ")}+00:00`;
}

function daysAgo(n: number, today: Date): Date {
  const date = new Date(today);
  date.setDate(date.getDate() - n);
  date.setHours(12, 0, 0, 0);
  return date;
}

function entry(created: string, karma: number) {
  return { task_name: "Test Task", karma, created_date: created };
}

const TODAY = new Date("2026-07-19T18:00:00Z");

describe("parseLogDate", () => {
  it("parses the space-separated format the API actually returns", () => {
    const date = parseLogDate("2026-07-17 16:21:23+00:00");
    expect(date).not.toBeNull();
    expect(date?.toISOString()).toBe("2026-07-17T16:21:23.000Z");
  });

  it("still parses proper ISO-8601 if the serializer is fixed", () => {
    const date = parseLogDate("2026-07-17T16:21:23Z");
    expect(date?.toISOString()).toBe("2026-07-17T16:21:23.000Z");
  });

  it("returns null for unparseable input", () => {
    expect(parseLogDate("not a date")).toBeNull();
  });
});

describe("buildHeatmapData", () => {
  it("places a recent entry on its own cell", () => {
    const when = daysAgo(3, TODAY);
    const data = buildHeatmapData(
      [entry(drfStamp(when), 42)] as UserLogData,
      TODAY,
    );

    expect(data.activityMap.get(toDateKey(when))).toBe(42);
    expect(data.windowKarma).toBe(42);
  });

  it("sums multiple entries landing on the same day", () => {
    const when = daysAgo(5, TODAY);
    const data = buildHeatmapData(
      [entry(drfStamp(when), 10), entry(drfStamp(when), 15)] as UserLogData,
      TODAY,
    );

    expect(data.activityMap.get(toDateKey(when))).toBe(25);
    expect(data.maxKarma).toBe(25);
  });

  it("excludes entries older than the rendered window from windowKarma", () => {
    const recent = daysAgo(10, TODAY);
    const ancient = new Date("2022-11-05T13:28:42Z");
    const data = buildHeatmapData(
      [
        entry(drfStamp(recent), 100),
        entry(drfStamp(ancient), 5000),
      ] as UserLogData,
      TODAY,
    );

    expect(data.windowKarma).toBe(100);
    expect(data.activityMap.get(toDateKey(ancient))).toBeUndefined();
  });

  it("ignores future-dated entries", () => {
    const future = daysAgo(-5, TODAY);
    const data = buildHeatmapData(
      [entry(drfStamp(future), 77)] as UserLogData,
      TODAY,
    );

    expect(data.windowKarma).toBe(0);
  });

  it("renders a full year of week columns", () => {
    const data = buildHeatmapData([], TODAY);

    expect(data.weeks).toHaveLength(HEATMAP_WEEKS);
    expect(data.weeks.every((week) => week.length === 7)).toBe(true);
  });

  it("labels every month across the window, in order, without duplicates", () => {
    const { monthLabels } = buildHeatmapData([], TODAY);

    // A 53-week window spans 12 or 13 month boundaries.
    expect(monthLabels.length).toBeGreaterThanOrEqual(12);
    const indices = monthLabels.map((label) => label.weekIndex);
    expect(indices).toEqual([...indices].sort((a, b) => a - b));
    expect(new Set(indices).size).toBe(indices.length);
  });

  it("treats a missing log as an empty window", () => {
    const data = buildHeatmapData(undefined, TODAY);

    expect(data.windowKarma).toBe(0);
    expect(data.maxKarma).toBe(1);
  });
});
