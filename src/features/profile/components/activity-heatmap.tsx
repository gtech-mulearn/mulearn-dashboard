/**
 * Activity Heatmap Component
 *
 * 📍 src/features/profile/components/activity-heatmap.tsx
 *
 * GitHub-style contribution heatmap for karma activities.
 * Shows last 52 weeks of activity with color intensity.
 */

"use client";

import { useMemo } from "react";
import type { UserLogData } from "../schemas";
import {
  buildHeatmapData,
  CELL_PITCH,
  toDateKey,
} from "../utils/activity.utils";

interface ActivityHeatmapProps {
  userLog?: UserLogData;
  isLoading?: boolean;
}

// TODO: heatmap intensity colors (emerald-200/300/400/500) are a data visualization gradient — leave as-is per design-system exception
// Color intensity levels
const COLORS = {
  empty: "bg-muted",
  level1: "bg-emerald-200",
  level2: "bg-emerald-300",
  level3: "bg-emerald-400",
  level4: "bg-emerald-500",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getColorLevel(karma: number, maxKarma: number): string {
  if (karma === 0) return COLORS.empty;
  const ratio = karma / maxKarma;
  if (ratio <= 0.25) return COLORS.level1;
  if (ratio <= 0.5) return COLORS.level2;
  if (ratio <= 0.75) return COLORS.level3;
  return COLORS.level4;
}

export function ActivityHeatmap({ userLog, isLoading }: ActivityHeatmapProps) {
  const { activityMap, maxKarma, weeks, windowKarma, monthLabels, today } =
    useMemo(() => {
      const now = new Date();
      return { ...buildHeatmapData(userLog, now), today: now };
    }, [userLog]);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card p-6 shadow-sm">
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="h-[140px] animate-pulse rounded bg-muted/50" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Activity Overview
          </h3>
          <p className="text-sm text-muted-foreground">
            {windowKarma.toLocaleString()} karma earned in the last year
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div className={`h-3 w-3 rounded-sm ${COLORS.empty}`} />
          <div className={`h-3 w-3 rounded-sm ${COLORS.level1}`} />
          <div className={`h-3 w-3 rounded-sm ${COLORS.level2}`} />
          <div className={`h-3 w-3 rounded-sm ${COLORS.level3}`} />
          <div className={`h-3 w-3 rounded-sm ${COLORS.level4}`} />
          <span>More</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        {/* Month labels — absolutely positioned so each sits above its week
            column; flex margins would compound and drift across the year. */}
        <div
          className="relative mb-1 ml-10 h-4"
          style={{ width: weeks.length * CELL_PITCH }}
        >
          {monthLabels.map(({ month, weekIndex }) => (
            <span
              key={`${month}-${weekIndex}`}
              className="absolute top-0 text-xs text-muted-foreground"
              style={{ left: weekIndex * CELL_PITCH }}
            >
              {month}
            </span>
          ))}
        </div>

        <div className="flex">
          {/* Day labels */}
          <div className="mr-2 flex w-8 flex-col gap-[3px]">
            {DAYS.map((day, i) => (
              <div
                key={day}
                className="flex h-[12px] items-center text-[10px] text-muted-foreground"
              >
                {i % 2 === 1 ? day : ""}
              </div>
            ))}
          </div>

          {/* Weeks grid */}
          <div className="flex gap-[3px]">
            {weeks.map((week) => (
              <div
                key={`week-${toDateKey(week[0])}`}
                className="flex flex-col gap-[3px]"
              >
                {week.map((day) => {
                  const dateStr = toDateKey(day);
                  const karma = activityMap.get(dateStr) || 0;
                  const isFuture = day > today;

                  return (
                    <div
                      key={dateStr}
                      title={
                        isFuture
                          ? ""
                          : `${karma} karma on ${day.toLocaleDateString()}`
                      }
                      className={`h-[12px] w-[12px] rounded-sm transition-all ${
                        isFuture
                          ? "bg-transparent"
                          : getColorLevel(karma, maxKarma)
                      } ${!isFuture && karma > 0 ? "hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1" : ""}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
