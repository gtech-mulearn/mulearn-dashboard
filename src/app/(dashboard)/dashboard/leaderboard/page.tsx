"use client";

import { useState } from "react";
import {
  type Category,
  type TimeFrame,
  Podium,
  LeaderboardCard,
  CategorySelector,
  TimeFrameToggle,
  useLeaderboard,
} from "@/features/leaderboard";
import { Loader2 } from "lucide-react";

export default function LeaderboardPage() {
  const [category, setCategory] = useState<Category>("students");
  const [timeframe, setTimeframe] = useState<TimeFrame>("monthly");

  const { data, isLoading, isError } = useLeaderboard(category, timeframe);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive font-semibold">
          Failed to load leaderboard. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 md:py-8 px-2 md:px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center justify-between mb-8 md:mb-16">
          <TimeFrameToggle selected={timeframe} onChange={setTimeframe} />
          <CategorySelector selected={category} onChange={setCategory} />
        </div>

        <Podium entries={data} />

        <div className="space-y-2 md:space-y-3 mt-8 md:mt-12">
          {data.slice(3).map((entry) => (
            <LeaderboardCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}
