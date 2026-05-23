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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudentLevels } from "../hooks";

export function StudentLevelsCard() {
  const { data: levels = [], isLoading } = useStudentLevels();

  return (
    <Card className="min-w-0 overflow-hidden border-border/60 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">
          Students by Level
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Member count at each MuLearn level
        </p>
      </CardHeader>
      <CardContent className="overflow-hidden p-2">
        {isLoading ? (
          <Skeleton className="m-4 h-48 w-full rounded-xl" />
        ) : levels.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            No level data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={192}>
            <BarChart
              data={levels}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                strokeOpacity={0.12}
              />
              <XAxis
                dataKey="level"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value) => [Number(value) || 0, "Students"]}
              />
              <Bar
                dataKey="count"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
