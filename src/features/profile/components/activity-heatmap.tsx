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

interface ActivityHeatmapProps {
  userLog?: UserLogData;
  isLoading?: boolean;
}

// Color intensity levels
const COLORS = {
  empty: "bg-muted",
  level1: "bg-emerald-200",
  level2: "bg-emerald-300",
  level3: "bg-emerald-400",
  level4: "bg-emerald-500",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

function getColorLevel(karma: number, maxKarma: number): string {
  if (karma === 0) return COLORS.empty;
  const ratio = karma / maxKarma;
  if (ratio <= 0.25) return COLORS.level1;
  if (ratio <= 0.5) return COLORS.level2;
  if (ratio <= 0.75) return COLORS.level3;
  return COLORS.level4;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function ActivityHeatmap({ userLog, isLoading }: ActivityHeatmapProps) {
  // Process log data into a map of date -> karma
  const { activityMap, maxKarma, weeks, totalKarma, monthLabels } =
    useMemo(() => {
      const map = new Map<string, number>();
      let max = 1;
      let total = 0;

      // Aggregate karma by date
      if (userLog) {
        for (const entry of userLog) {
          const date = entry.created_date.split("T")[0];
          const existing = map.get(date) || 0;
          map.set(date, existing + entry.karma);
          max = Math.max(max, existing + entry.karma);
          total += entry.karma;
        }
      }

      // Generate last 52 weeks of dates
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday

      const weeksArray: Date[][] = [];
      const monthLabelsMap: { month: string; weekIndex: number }[] = [];
      let lastMonth = -1;

      // Go back 52 weeks
      for (let w = 52; w >= 0; w--) {
        const weekDates: Date[] = [];
        const weekStart = new Date(startOfWeek);
        weekStart.setDate(startOfWeek.getDate() - w * 7);

        for (let d = 0; d < 7; d++) {
          const day = new Date(weekStart);
          day.setDate(weekStart.getDate() + d);
          weekDates.push(day);

          // Track month labels
          if (day.getMonth() !== lastMonth && d === 0) {
            monthLabelsMap.push({
              month: MONTHS[day.getMonth()],
              weekIndex: 52 - w,
            });
            lastMonth = day.getMonth();
          }
        }
        weeksArray.push(weekDates);
      }

      return {
        activityMap: map,
        maxKarma: max,
        weeks: weeksArray,
        totalKarma: total,
        monthLabels: monthLabelsMap,
      };
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
            {totalKarma.toLocaleString()} karma earned this year
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
        {/* Month labels */}
        <div className="mb-1 flex gap-[3px] pl-10">
          {monthLabels.map(({ month, weekIndex }) => (
            <div
              key={`${month}-${weekIndex}`}
              className="text-xs text-muted-foreground"
              style={{
                marginLeft: `${weekIndex * 15}px`,
              }}
            >
              {month}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Day labels */}
          <div className="mr-2 flex flex-col gap-[3px]">
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
                key={`week-${formatDate(week[0])}`}
                className="flex flex-col gap-[3px]"
              >
                {week.map((day) => {
                  const dateStr = formatDate(day);
                  const karma = activityMap.get(dateStr) || 0;
                  const isFuture = day > new Date();

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
