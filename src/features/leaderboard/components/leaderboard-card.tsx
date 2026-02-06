"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { LeaderboardEntry } from "../types/leaderboard.type";
import { TrendingUp } from "lucide-react";

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
}

export function LeaderboardCard({ entry }: LeaderboardCardProps) {
  return (
    <Card className="group hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="shrink-0 relative">
            <div className="w-10 h-10 md:w-16 md:h-16 flex items-center justify-center relative overflow-hidden">
              <span className="text-xl md:text-2xl font-semibold relative z-10">
                {entry.rank}
              </span>
            </div>
          </div>
          <div className="shrink-0 w-10 h-10 md:w-14 md:h-14 rounded-full bg-primary flex items-center justify-center relative overflow-hidden">
            <span className="text-lg md:text-xl font-semibold text-secondary relative z-10">
              {entry.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-1 md:gap-2">
              <h3 className="font-semibold text-sm md:text-lg text-foreground uppercase tracking-tight wrap-break-word">
                {entry.name}
              </h3>
              <div className="shrink-0">
                <TrendingUp className="w-4 h-4 text-chart-2" />
              </div>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="bg-primary text-secondary rounded-2xl px-2 md:px-4 py-1 md:py-2 relative">
              <div className="font-black text-sm md:text-xl tabular-nums">
                {entry.karma.toLocaleString()}
              </div>
            </div>
            <p className="text-[8px] md:text-[10px] font-black mt-1 text-gray-500 tracking-widest uppercase">
              KARMA
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
