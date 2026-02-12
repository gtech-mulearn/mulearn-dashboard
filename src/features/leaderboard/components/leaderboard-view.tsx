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
    <div className="max-w-7xl mx-auto min-h-screen">
      <LeaderboardControls
        category={category}
        timeframe={timeframe}
        wadhwaniTimeframe={wadhwaniTimeframe}
      />

      {isLoading ? (
        <div className="space-y-4">
          <div className="flex gap-4 items-end justify-center mb-8 md:mb-12 h-64">
            <Skeleton className="h-48 w-24" />
            <Skeleton className="h-64 w-24" />
            <Skeleton className="h-40 w-24" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons don't have stable IDs
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-red-500 gap-2">
          <AlertCircle className="w-8 h-8" />
          <p>Failed to load leaderboard data.</p>
        </div>
      ) : data && data.length > 0 ? (
        <>
          <Podium entries={data} />
          <div className="space-y-2 md:space-y-3 mt-8 md:mt-12">
            {data.slice(3).map((entry) => (
              <LeaderboardCard key={entry.id} entry={entry} />
            ))}
          </div>
        </>
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
