"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltip, seriesColor } from "@/components/charts/chart-theme";

interface CountryBreakdownProps {
  data: Record<string, number>;
}

const LEGEND_SCROLL_THRESHOLD = 6;

export function CountryBreakdown({ data }: CountryBreakdownProps) {
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

  const scrollable = chartData.length > LEGEND_SCROLL_THRESHOLD;

  return (
    <div className="w-full">
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={seriesColor(index)}
                  stroke="var(--card)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="relative mt-2">
        <ul
          className={`grid grid-cols-2 gap-x-4 gap-y-1 overflow-y-auto pr-1 ${
            scrollable ? "max-h-24" : ""
          }`}
        >
          {chartData.map((entry, index) => (
            <li
              key={entry.name}
              className="flex items-center gap-1.5 truncate text-xs"
              style={{ color: "var(--chart-axis)" }}
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: seriesColor(index) }}
              />
              <span className="truncate">{entry.name}</span>
            </li>
          ))}
        </ul>
        {scrollable && (
          <p className="mt-1 text-center text-[10px] text-muted-foreground">
            Scroll to see more
          </p>
        )}
      </div>
    </div>
  );
}
