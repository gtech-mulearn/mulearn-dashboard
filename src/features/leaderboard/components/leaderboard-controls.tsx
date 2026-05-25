"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
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
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center justify-between mb-8 md:mb-16">
      {category === "mentors" ? (
        <div />
      ) : category === "wadhwani" ? (
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
      <CategorySelector
        selected={category}
        onChange={(val) => updateParam("category", val)}
      />
    </div>
  );
}
