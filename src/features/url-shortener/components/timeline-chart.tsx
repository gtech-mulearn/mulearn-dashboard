"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AXIS_PROPS,
  ChartGradients,
  ChartTooltip,
  GRID_PROPS,
  seriesColor,
  seriesGradient,
} from "@/components/charts/chart-theme";

interface TimelineChartProps {
  data: Array<{ time: string; clicks: number }>;
}

export function TimelineChart({ data }: TimelineChartProps) {
  const chartData = data.map((item) => ({
    time: new Date(item.time).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    clicks: item.clicks,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <ChartGradients />
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="time" {...AXIS_PROPS} />
          <YAxis {...AXIS_PROPS} />
          <Tooltip
            cursor={{ stroke: "var(--chart-grid)" }}
            content={<ChartTooltip />}
          />
          <Area
            type="monotone"
            dataKey="clicks"
            name="Clicks"
            stroke={seriesColor(0)}
            strokeWidth={2}
            fill={seriesGradient(0)}
            dot={{ fill: seriesColor(0), r: 3 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
