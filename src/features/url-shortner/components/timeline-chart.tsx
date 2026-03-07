"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TimelineChartProps {
  data: Array<{
    time: string;
    clicks: number;
  }>;
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
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis stroke="#999999" style={{ fontSize: "12px" }} />
          <YAxis stroke="#999999" style={{ fontSize: "12px" }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="clicks"
            stroke="#0961f5"
            strokeWidth={2}
            dot={{ fill: "#0961f5", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
