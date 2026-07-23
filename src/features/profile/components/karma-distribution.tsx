/**
 * Karma Distribution Chart Component
 *
 * 📍 src/features/profile/components/karma-distribution.tsx
 *
 * Donut chart of karma broken down straight from the API's split fields —
 * no derived buckets, just what `org_ig_karma_split`, `event_karma_split`,
 * `intern_karma`, and `general_enablement_karma` already report.
 *
 * Layout: chart left / legend right on desktop, chart above legend on
 * mobile. Total karma sits fixed in the donut's center. On desktop only,
 * hovering either the ring or a legend row brightens that slice — mobile
 * gets no touch interaction, just a static readable chart + legend.
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { CHART_SERIES } from "@/components/charts/chart-theme";
import type { UserProfile } from "../schemas";

interface KarmaDistributionProps {
  profile: UserProfile;
}

/**
 * The shared --chart-1..5 tokens only give 5 distinct hues, but this chart
 * commonly has 6 slices (up to 5 IGs collapsed + event/intern/general). Add
 * --success as a 6th, already-themed color not otherwise used in charts.
 */
const SLICE_COLORS = [...CHART_SERIES.map((c) => c.token), "var(--success)"];
const sliceColor = (index: number) =>
  SLICE_COLORS[
    ((index % SLICE_COLORS.length) + SLICE_COLORS.length) % SLICE_COLORS.length
  ];

/** Desktop-only: matches (hover: hover) and (pointer: fine), so touch devices never get hover/click affordances. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
    setIsDesktop(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}

export function KarmaDistribution({ profile }: KarmaDistributionProps) {
  const isDesktop = useIsDesktop();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    const slices = [
      ...profile.org_ig_karma_split.map((ig) => ({
        name: ig.ig_name,
        value: ig.karma,
      })),
      ...profile.event_karma_split.map((event) => ({
        name: event.event_name ?? "Event Task",
        value: event.karma,
      })),
      { name: "Intern Task", value: profile.intern_karma },
      { name: "General Enablement", value: profile.general_enablement_karma },
    ];
    return slices
      .filter((slice) => slice.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [profile]);

  if (chartData.length === 0) {
    return (
      <div className="text-center">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Karma Distribution
        </h3>
        <div className="rounded-xl bg-muted p-6 text-sm text-muted-foreground">
          <p>No karma data to display yet.</p>
          <p className="mt-1 text-xs">Complete tasks to see your breakdown!</p>
        </div>
      </div>
    );
  }

  const total = chartData.reduce((sum, slice) => sum + slice.value, 0);
  const active = activeIndex != null ? chartData[activeIndex] : null;
  const activePercent = active
    ? Math.round((active.value / total) * 100)
    : null;

  const desktopHoverProps = isDesktop
    ? {
        onMouseEnter: (_: unknown, index: number) => setActiveIndex(index),
        onMouseLeave: () => setActiveIndex(null),
      }
    : {};

  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Karma Distribution
      </h3>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center sm:gap-8">
        {/* Chart */}
        <div
          className={`relative h-52 w-52 shrink-0 ${isDesktop ? "" : "touch-none"}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                isAnimationActive={false}
                {...desktopHoverProps}
              >
                {chartData.map((entry, index) => {
                  const dimmed = activeIndex != null && activeIndex !== index;
                  return (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={sliceColor(index)}
                      stroke="var(--card)"
                      strokeWidth={2}
                      opacity={dimmed ? 0.35 : 1}
                      style={{
                        filter:
                          isDesktop && activeIndex === index
                            ? "brightness(1.2)"
                            : undefined,
                        transition: "opacity 150ms ease, filter 150ms ease",
                        cursor: isDesktop ? "pointer" : "default",
                      }}
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            {active ? (
              <>
                <span className="max-w-[6rem] truncate text-sm font-bold text-foreground">
                  {active.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {active.value.toLocaleString()} · {activePercent}%
                </span>
              </>
            ) : (
              <>
                <span className="text-xl font-bold text-foreground">
                  {total.toLocaleString()}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Total Karma
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <ul className="w-full min-w-0 space-y-1 sm:max-w-[13rem] max-h-40 overflow-y-auto sm:max-h-none sm:overflow-visible">
          {chartData.map((entry, index) => (
            <li key={entry.name}>
              <button
                type="button"
                disabled={!isDesktop}
                onMouseEnter={() => isDesktop && setActiveIndex(index)}
                onMouseLeave={() => isDesktop && setActiveIndex(null)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                  isDesktop ? "hover:bg-muted" : ""
                } ${activeIndex === index ? "bg-muted" : ""}`}
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: sliceColor(index) }}
                />
                <span className="min-w-0 flex-1 truncate text-foreground">
                  {entry.name}
                </span>
                <span className="shrink-0 font-semibold text-muted-foreground">
                  {entry.value.toLocaleString()}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
