"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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
      <div className="h-64 flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis stroke="#999999" style={{ fontSize: "12px" }} />
          <YAxis stroke="#999999" style={{ fontSize: "12px" }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#0961f5" radius={6} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
