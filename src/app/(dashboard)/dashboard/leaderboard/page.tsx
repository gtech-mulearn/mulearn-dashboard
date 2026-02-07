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
import Loader from "@/app/loading";

export default function LeaderboardPage() {
  const [category, setCategory] = useState<Category>("students");
  const [timeframe, setTimeframe] = useState<TimeFrame>("monthly");

  const { data, isLoading, isError } = useLeaderboard(category, timeframe);

  if (isLoading) {
    return <Loader />;
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
    <div className="w-full mx-auto min-h-screen">
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
  );
}
