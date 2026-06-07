"use client";

import { useMemo } from "react";
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

  // Sort levels strictly in ascending order (Level 1 to Level 7)
  const sortedLevels = useMemo(() => {
    return [...levels].sort((a, b) => {
      const getNum = (val: string) => {
        const match = val.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      };
      return getNum(a.level) - getNum(b.level);
    });
  }, [levels]);

  // Generate integer ticks for YAxis to prevent decimals or skips
  const maxCount = useMemo(() => {
    return Math.max(...levels.map((l) => l.count), 0);
  }, [levels]);

  const yAxisTicks = useMemo(() => {
    if (maxCount <= 0) return [0];
    if (maxCount <= 6) {
      return Array.from({ length: maxCount + 1 }, (_, i) => i);
    }
    const step = Math.ceil(maxCount / 5);
    const ticks = [];
    for (let i = 0; i <= maxCount; i += step) {
      ticks.push(i);
    }
    if (ticks[ticks.length - 1] < maxCount) {
      ticks.push(ticks[ticks.length - 1] + step);
    }
    return ticks;
  }, [maxCount]);

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
        ) : sortedLevels.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            No level data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={192}>
            <BarChart
              data={sortedLevels}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                strokeOpacity={0.12}
              />
              <XAxis
                dataKey="level"
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
                ticks={yAxisTicks}
                domain={[0, yAxisTicks[yAxisTicks.length - 1] || "auto"]}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.15 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-border/60 bg-white/95 dark:bg-zinc-800/95 p-2.5 shadow-xl backdrop-blur-sm text-xs font-semibold">
                        <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          {data.level}
                        </p>
                        <p className="text-sm font-black text-primary">
                          {data.count}{" "}
                          {data.count === 1 ? "Student" : "Students"}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
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
