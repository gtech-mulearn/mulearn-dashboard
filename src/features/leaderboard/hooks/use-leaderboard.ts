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

export function useLeaderboard(
  category: Category,
  timeframe: TimeFrame | WadhwaniTimeFrame,
) {
  const monthly = timeframe === "monthly";
  const campus = timeframe === "campus";

  const leaderboardKeys = {
    all: ["leaderboard"] as const,
    students: (monthly: boolean) =>
      [...leaderboardKeys.all, "students", { monthly }] as const,
    college: (monthly: boolean) =>
      [...leaderboardKeys.all, "college", { monthly }] as const,
    wadhwani: (campus: boolean) =>
      [...leaderboardKeys.all, "wadhwani", { campus }] as const,
  };

  return useQuery({
    queryKey:
      category === "campus"
        ? leaderboardKeys.college(monthly)
        : category === "wadhwani"
          ? leaderboardKeys.wadhwani(campus)
          : leaderboardKeys.students(monthly),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
        if (category === "wadhwani") {
          const data = await fetchWadhwaniLeaderboard(campus);
          return data.map((item, index) => ({
            id: item.code,
            rank: index + 1,
            zone_name: item.zone_name,
            name: item.title || item.code,
            karma: item.total_karma,
          }));
        }
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
