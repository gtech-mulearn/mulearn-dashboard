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

interface ClicksChartProps {
  total: number;
}

export function ClicksChart({ total }: ClicksChartProps) {
  const data = [{ name: "Clicks", value: total, fill: "#0961f5" }];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis type="number" stroke="#999999" />
          <YAxis dataKey="name" type="category" stroke="#999999" />
          <Tooltip />
          <Bar dataKey="value" fill="#0961f5" radius={6} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
