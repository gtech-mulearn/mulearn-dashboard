"use client";

import { format, parseISO } from "date-fns";
import { Activity } from "lucide-react";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WeeklyKarmaCardProps } from "../types";

export const WeeklyKarmaCard = ({ data = [] }: WeeklyKarmaCardProps) => {
  const maxWeeklyKarma = useMemo(
    () => Math.max(...data.map((d) => d.value), 0),
    [data],
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Weekly Karma Trend</CardTitle>
        <div className="text-[10px] bg-muted px-2 py-1 rounded text-muted-foreground uppercase">
          Last 7 days
        </div>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="flex h-64 items-end gap-3 pt-12 px-2 pb-2">
            {data.map((day) => {
              const height =
                maxWeeklyKarma > 0 ? (day.value / maxWeeklyKarma) * 100 : 0;
              const dateObj = parseISO(day.date);
              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center gap-2 group relative h-full"
                >
                  <div className="flex-1 w-full flex flex-col items-center justify-end gap-2">
                    <span
                      className={`text-[12px] font-bold transition-opacity ${day.value > 0 ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                    >
                      {day.value}
                    </span>
                    <div
                      className="w-full bg-primary transition-all rounded-t-md relative cursor-default border-t border-x border-primary/10"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    >
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-bold px-2 py-1.5 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border pointer-events-none">
                        {day.value} Karma
                        <br />
                        <span className="text-muted-foreground font-normal">
                          {format(dateObj, "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="h-10 flex flex-col items-center justify-start mt-1">
                    <span className="text-[12px] text-muted-foreground font-bold uppercase tracking-widest">
                      {format(dateObj, "EEE")}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {format(dateObj, "MM/dd")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
            <div className="text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p>No activity data for this week</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
