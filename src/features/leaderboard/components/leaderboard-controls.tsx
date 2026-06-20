"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { PageHeader } from "@/components/ui/page-header";
import {
  type Category,
  CategorySelector,
  type TimeFrame,
  TimeFrameToggle,
  type WadhwaniTimeFrame,
  WadhwaniTimeFrameToggle,
} from "..";

interface LeaderboardControlsProps {
  category: Category;
  timeframe: TimeFrame;
  wadhwaniTimeframe: WadhwaniTimeFrame;
}

export function LeaderboardControls({
  category,
  timeframe,
  wadhwaniTimeframe,
}: LeaderboardControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  const updateParam = (key: string, value: string) => {
    router.push(`${pathname}?${createQueryString(key, value)}`);
  };

  return (
    <div className="mb-8 md:mb-10">
      {/* Page header */}
      <PageHeader
        title="Leaderboard"
        description="Recognizing top learners in the µLearn community."
        className="mb-8 md:mb-10"
      />

      {/* Controls row */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Left: timeframe toggle */}
        <div>
          {category === "wadhwani" ? (
            <WadhwaniTimeFrameToggle
              selected={wadhwaniTimeframe}
              onChange={(val) => updateParam("wadhwaniTimeframe", val)}
            />
          ) : (
            <TimeFrameToggle
              selected={timeframe}
              onChange={(val) => updateParam("timeframe", val)}
            />
          )}
        </div>

        {/* Right: category selector */}
        <CategorySelector
          selected={category}
          onChange={(val) => updateParam("category", val)}
        />
      </div>
    </div>
  );
}
