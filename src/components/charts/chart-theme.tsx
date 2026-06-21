"use client";

import type { ReactElement } from "react";
import type { TooltipContentProps } from "recharts";

/**
 * Single source of truth for chart theming. Every chart imports from here so
 * colors, gradients, axes, grids, and tooltips stay consistent and on-brand.
 * Colors resolve from the --chart-* design tokens (see globals.css), so light
 * and dark themes are handled automatically.
 */

export const CHART_SERIES: { token: string; gradientId: string }[] = [
  { token: "var(--chart-1)", gradientId: "chart-grad-1" },
  { token: "var(--chart-2)", gradientId: "chart-grad-2" },
  { token: "var(--chart-3)", gradientId: "chart-grad-3" },
  { token: "var(--chart-4)", gradientId: "chart-grad-4" },
  { token: "var(--chart-5)", gradientId: "chart-grad-5" },
];

export const seriesColor = (index: number): string =>
  CHART_SERIES[((index % 5) + 5) % 5].token;

export const seriesGradient = (index: number): string =>
  `url(#${CHART_SERIES[((index % 5) + 5) % 5].gradientId})`;

export const BAR_RADIUS: [number, number, number, number] = [8, 8, 0, 0];
export const MAX_BAR_SIZE = 48;

/** Horizontal-only dashed gridlines in the muted grid token. */
export const GRID_PROPS = {
  vertical: false,
  strokeDasharray: "4 4",
  stroke: "var(--chart-grid)",
} as const;

/** Clean axes: no lines, muted 12px/500 tick labels. */
export const AXIS_PROPS = {
  axisLine: false,
  tickLine: false,
  tick: { fill: "var(--chart-axis)", fontSize: 12, fontWeight: 500 },
} as const;

/**
 * <defs> with one vertical gradient per series (90% -> 10% opacity).
 * Render once inside each chart; reference fills with seriesGradient(i).
 */
export function ChartGradients(): ReactElement {
  return (
    <defs>
      {CHART_SERIES.map(({ token, gradientId }) => (
        <linearGradient
          key={gradientId}
          id={gradientId}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={token} stopOpacity={0.9} />
          <stop offset="100%" stopColor={token} stopOpacity={0.1} />
        </linearGradient>
      ))}
    </defs>
  );
}

type ChartTooltipProps = Partial<TooltipContentProps<number, string>> & {
  /** Optional unit/label suffix appended to each value. */
  valueSuffix?: string;
};

/** Branded tooltip: rounded popover surface, colored dot per entry. */
export function ChartTooltip({
  active,
  payload,
  label,
  valueSuffix,
}: ChartTooltipProps): ReactElement | null {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-popover-foreground shadow-lg">
      {label != null && label !== "" && (
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry) => (
          <div
            key={`${entry.name}-${entry.dataKey}`}
            className="flex items-center gap-2 text-xs font-semibold"
          >
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-bold text-foreground">
              {typeof entry.value === "number"
                ? entry.value.toLocaleString()
                : entry.value}
              {valueSuffix ?? ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
