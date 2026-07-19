/**
 * Activity Heatmap Utilities
 *
 * 📍 src/features/profile/utils/activity.utils.ts
 *
 * Pure date/aggregation helpers behind the contribution heatmap.
 * Kept out of the component so the bucketing rules are testable.
 */

import type { UserLogData } from "../schemas";

/** Weeks rendered in the grid (52 back + the current one). */
export const HEATMAP_WEEKS = 53;

/** Cell size + gap, in px. Column pitch for month label positioning. */
export const CELL_PITCH = 15;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export interface MonthLabel {
  month: string;
  weekIndex: number;
}

export interface HeatmapData {
  /** date key -> karma earned that day, windowed to the grid */
  activityMap: Map<string, number>;
  /** busiest single day in the window, floor of 1 so ratios stay finite */
  maxKarma: number;
  weeks: Date[][];
  /** karma earned inside the rendered window only */
  windowKarma: number;
  monthLabels: MonthLabel[];
}

/**
 * Parse a log timestamp.
 *
 * `created_date` comes from a DRF `CharField` wrapping a datetime, so the wire
 * format is Python's `str(datetime)` — "2026-07-17 16:21:23+00:00" — with a
 * space separator rather than ISO-8601's "T". Accept both, so this keeps
 * working if the serializer is ever corrected to a real DateTimeField.
 */
export function parseLogDate(createdDate: string): Date | null {
  const date = new Date(createdDate.replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Local-time YYYY-MM-DD key.
 *
 * Must be used for both grid cells and log entries — mixing a UTC key
 * (toISOString) with locally-built cell dates shifts activity by a day for
 * anyone not on UTC.
 */
export function toDateKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Sunday-aligned grid of the last HEATMAP_WEEKS weeks, oldest first. */
function buildWeeks(today: Date): Date[][] {
  const startOfWeek = new Date(today);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const weeks: Date[][] = [];
  for (let w = HEATMAP_WEEKS - 1; w >= 0; w--) {
    const weekStart = new Date(startOfWeek);
    weekStart.setDate(startOfWeek.getDate() - w * 7);

    const days: Date[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + d);
      days.push(day);
    }
    weeks.push(days);
  }
  return weeks;
}

/** One label per month transition, positioned by week column. */
function buildMonthLabels(weeks: Date[][]): MonthLabel[] {
  const labels: MonthLabel[] = [];
  let lastMonth = -1;

  weeks.forEach((week, weekIndex) => {
    const month = week[0].getMonth();
    if (month !== lastMonth) {
      labels.push({ month: MONTHS[month], weekIndex });
      lastMonth = month;
    }
  });

  return labels;
}

/**
 * Bucket log entries into the rendered window.
 *
 * Entries outside the window are ignored entirely — including in
 * `windowKarma`, so the caption can never disagree with the cells.
 */
export function buildHeatmapData(
  userLog: UserLogData | undefined,
  today: Date = new Date(),
): HeatmapData {
  const weeks = buildWeeks(today);
  const windowStart = weeks[0][0];

  const activityMap = new Map<string, number>();
  let maxKarma = 1;
  let windowKarma = 0;

  for (const entry of userLog ?? []) {
    const date = parseLogDate(entry.created_date);
    if (!date || date < windowStart || date > today) continue;

    const key = toDateKey(date);
    const dayTotal = (activityMap.get(key) ?? 0) + entry.karma;
    activityMap.set(key, dayTotal);
    maxKarma = Math.max(maxKarma, dayTotal);
    windowKarma += entry.karma;
  }

  return {
    activityMap,
    maxKarma,
    weeks,
    windowKarma,
    monthLabels: buildMonthLabels(weeks),
  };
}
