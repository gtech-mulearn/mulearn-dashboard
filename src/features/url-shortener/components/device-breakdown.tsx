"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AXIS_PROPS,
  BAR_RADIUS,
  ChartGradients,
  ChartTooltip,
  GRID_PROPS,
  MAX_BAR_SIZE,
  seriesGradient,
} from "@/components/charts/chart-theme";

interface DeviceBreakdownProps {
  data: Record<string, number>;
}

export function DeviceBreakdown({ data }: DeviceBreakdownProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <ChartGradients />
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="name" {...AXIS_PROPS} />
          <YAxis {...AXIS_PROPS} />
          <Tooltip
            cursor={{ fill: "var(--color-muted)", opacity: 0.2 }}
            content={<ChartTooltip />}
          />
          <Bar
            dataKey="value"
            name="Visits"
            fill={seriesGradient(0)}
            radius={BAR_RADIUS}
            maxBarSize={MAX_BAR_SIZE}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
