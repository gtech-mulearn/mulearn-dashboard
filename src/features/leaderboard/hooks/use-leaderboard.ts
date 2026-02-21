/**
 * Leaderboard Hook
 *
 * 📍 src/features/leaderboard/hooks/use-leaderboard.ts
 *
 * TanStack Query for fetching leaderboard data.
 */

"use client";
import { useQuery } from "@tanstack/react-query";
import {
  fetchCampusLeaderboard,
  fetchStudentLeaderboard,
  fetchWadhwaniLeaderboard,
} from "../api";
import type {
  Category,
  LeaderboardEntry,
  TimeFrame,
  WadhwaniTimeFrame,
} from "../types";
import { leaderboardKeys } from "./query-keys";

export function useLeaderboard(
  category: Category,
  timeframe: TimeFrame | WadhwaniTimeFrame,
) {
  const monthly = timeframe === "monthly";
  const campus = timeframe === "campus";

  return useQuery({
    queryKey:
      category === "campus"
        ? leaderboardKeys.college(monthly)
        : category === "wadhwani"
          ? leaderboardKeys.wadhwani(campus)
          : leaderboardKeys.students(monthly),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      if (category === "campus") return await fetchCampusLeaderboard(monthly);
      if (category === "wadhwani")
        return await fetchWadhwaniLeaderboard(campus);
      return await fetchStudentLeaderboard(monthly);
    },
    select: (data: any[]): LeaderboardEntry[] => {
      if (category === "campus") {
        return data.map((item, index) => ({
          id: item.code,
          rank: index + 1,
          name: item.title || item.code,
          karma: item.total_karma,
        }));
      }
      if (category === "wadhwani") {
        return data.map((item, index) => ({
          id: item.code,
          rank: index + 1,
          zone_name: item.zone_name,
          name: item.title || item.code,
          karma: item.total_karma,
        }));
      }
      return data.map((item, index) => ({
        id: item.full_name,
        rank: index + 1,
        name: item.full_name,
        karma: item.total_karma,
        avatar: item.profile_pic,
      }));
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
