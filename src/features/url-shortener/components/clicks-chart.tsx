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
  ChartGradients,
  ChartTooltip,
  GRID_PROPS,
  MAX_BAR_SIZE,
  seriesGradient,
} from "@/components/charts/chart-theme";

interface ClicksChartProps {
  total: number;
}

export function ClicksChart({ total }: ClicksChartProps) {
  const data = [{ name: "Clicks", value: total }];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <ChartGradients />
          <CartesianGrid {...GRID_PROPS} horizontal={false} vertical />
          <XAxis type="number" {...AXIS_PROPS} />
          <YAxis dataKey="name" type="category" {...AXIS_PROPS} />
          <Tooltip
            cursor={{ fill: "var(--color-muted)", opacity: 0.2 }}
            content={<ChartTooltip />}
          />
          <Bar
            dataKey="value"
            name="Clicks"
            fill={seriesGradient(0)}
            radius={[0, 8, 8, 0]}
            maxBarSize={MAX_BAR_SIZE}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
