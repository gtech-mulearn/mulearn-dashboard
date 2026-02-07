"use client";

import { useState } from "react";
import Loader from "@/app/loading";
import {
  type Category,
  CategorySelector,
  LeaderboardCard,
  Podium,
  type TimeFrame,
  TimeFrameToggle,
  useLeaderboard,
  type WadhwaniTimeFrame,
  WadhwaniTimeFrameToggle,
} from "@/features/leaderboard";

export default function LeaderboardPage() {
  const [category, setCategory] = useState<Category>("students");
  const [timeframe, setTimeframe] = useState<TimeFrame>("monthly");
  const [wadhwaniTimeframe, setWadhwaniTimeframe] =
    useState<WadhwaniTimeFrame>("campus");
  const currentTimeframe: TimeFrame | WadhwaniTimeFrame =
    category === "wadhwani" ? wadhwaniTimeframe : timeframe;

  const { data, isLoading, isError } = useLeaderboard(
    category,
    currentTimeframe,
  );

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
    <div className="max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center justify-between mb-8 md:mb-16">
        {category === "wadhwani" ? (
          <WadhwaniTimeFrameToggle
            selected={wadhwaniTimeframe}
            onChange={setWadhwaniTimeframe}
          />
        ) : (
          <TimeFrameToggle selected={timeframe} onChange={setTimeframe} />
        )}
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
