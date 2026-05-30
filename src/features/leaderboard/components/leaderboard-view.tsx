"use client";

import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeaderboard } from "../hooks/use-leaderboard";
import type { Category, TimeFrame, WadhwaniTimeFrame } from "../types";
import { LeaderboardCard } from "./leaderboard-card";
import { LeaderboardControls } from "./leaderboard-controls";
import { Podium } from "./podium";

interface LeaderboardViewProps {
  category: Category;
  timeframe: TimeFrame;
  wadhwaniTimeframe: WadhwaniTimeFrame;
}

export function LeaderboardView({
  category,
  timeframe,
  wadhwaniTimeframe,
}: LeaderboardViewProps) {
  const { data, isLoading, isError } = useLeaderboard(
    category,
    category === "wadhwani" ? wadhwaniTimeframe : timeframe,
  );

  return (
    <div className="max-w-7xl mx-auto min-h-screen px-4 pb-12">
      {/* Controls */}
      <LeaderboardControls
        category={category}
        timeframe={timeframe}
        wadhwaniTimeframe={wadhwaniTimeframe}
      />

      {isLoading ? (
        <div className="space-y-8">
          {/* Podium skeleton */}
          <div className="flex items-end justify-center gap-3 md:gap-6 px-4 pt-8">
            <Skeleton className="h-52 flex-1 rounded-2xl" />
            <Skeleton className="h-64 flex-1 rounded-2xl -translate-y-6" />
            <Skeleton className="h-48 flex-1 rounded-2xl" />
          </div>
          {/* List skeleton */}
          <div className="rounded-2xl border border-border overflow-hidden">
            <Skeleton className="h-14 w-full rounded-none" />
            <Skeleton className="h-10 w-full rounded-none border-b border-border" />
            {[1, 2, 3, 4, 5].map((key) => (
              <Skeleton
                key={key}
                className="h-[68px] w-full rounded-none border-b border-border last:border-0"
              />
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-destructive gap-2">
          <AlertCircle className="w-8 h-8" />
          <p>Failed to load leaderboard data.</p>
        </div>
      ) : data && data.length > 0 ? (
        <div className="space-y-8">
          {/* Podium (top 3 cards) */}
          <Podium entries={data} />

          {/* All contributors section */}
          <div className="rounded-2xl border border-border overflow-hidden shadow-sm">
            {/* Table column headers */}
            <div className="flex items-center py-2.5 px-4 md:px-8 bg-muted/50 border-b border-border">
              <div className="w-10 md:w-14 flex-shrink-0">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                  Rank
                </span>
              </div>
              <div className="flex-1 pl-12">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                  Learner
                </span>
              </div>
              <div className="w-28 md:w-40 text-right flex-shrink-0">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                  Karma
                </span>
              </div>
            </div>

            {/* Rows (rank 4 and below) */}
            <div className="bg-card">
              {data.slice(3).map((entry) => (
                <LeaderboardCard key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-[50vh] flex items-center justify-center">
          <p className="text-muted-foreground">
            No leaderboard data available.
          </p>
        </div>
      )}
    </div>
  );
}
