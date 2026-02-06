/**
 * Leaderboard Hook
 *
 * 📍 src/features/leaderboard/hooks/use-leaderboard.ts
 *
 * TanStack Query for fetching leaderboard data.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStudentLeaderboard, fetchCampusLeaderboard } from "../api";
import type {
  Category,
  TimeFrame,
  LeaderboardEntry,
} from "../types/leaderboard.type";

export function useLeaderboard(category: Category, timeframe: TimeFrame) {
  const monthly = timeframe === "monthly";
  const leaderboardKeys = {
    all: ["leaderboard"] as const,
    students: (monthly: boolean) =>
      [...leaderboardKeys.all, "students", { monthly }] as const,
    college: (monthly: boolean) =>
      [...leaderboardKeys.all, "college", { monthly }] as const,
  };

  return useQuery({
    queryKey:
      category === "campus"
        ? leaderboardKeys.college(monthly)
        : leaderboardKeys.students(monthly),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      try {
        if (category === "campus") {
          const data = await fetchCampusLeaderboard(monthly);
          return data.map((item, index) => ({
            id: item.code,
            rank: index + 1,
            name: item.title || item.code,
            karma: item.total_karma,
          }));
        }

        // Default to students for all other categories
        const data = await fetchStudentLeaderboard(monthly);
        return data.map((item, index) => ({
          id: item.full_name,
          rank: index + 1,
          name: item.full_name,
          karma: item.total_karma,
          avatar: item.profile_pic,
        }));
      } catch {
        return [];
      }
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
