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
  CollegeLeaderboardEntry,
  StudentLeaderboardEntry,
  WadhwaniLeaderboardEntry,
} from "../schemas";
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
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      if (category === "campus") return await fetchCampusLeaderboard(monthly);
      if (category === "wadhwani")
        return await fetchWadhwaniLeaderboard(campus);
      return await fetchStudentLeaderboard(monthly);
    },
    select: (
      data:
        | StudentLeaderboardEntry[]
        | CollegeLeaderboardEntry[]
        | WadhwaniLeaderboardEntry[],
    ): LeaderboardEntry[] => {
      if (!data || !Array.isArray(data)) return [];

      const seenIds = new Set<string>();

      if (category === "campus") {
        return (data as CollegeLeaderboardEntry[])
          .map((item, index) => {
            const id = item.code || `college-${index}`;
            if (seenIds.has(id)) return null;
            seenIds.add(id);

            const entry: LeaderboardEntry = {
              id,
              rank: index + 1,
              name: item.title || item.code,
              karma: item.total_karma,
            };

            return entry;
          })
          .filter((item): item is LeaderboardEntry => item !== null);
      }

      if (category === "wadhwani") {
        return (data as WadhwaniLeaderboardEntry[])
          .map((item, index) => {
            const id = item.code || `wadhwani-${index}`;
            if (seenIds.has(id)) return null;
            seenIds.add(id);

            const entry: LeaderboardEntry = {
              id,
              rank: index + 1,
              name: item.title || item.code,
              karma: item.total_karma,
            };

            return entry;
          })
          .filter((item): item is LeaderboardEntry => item !== null);
      }

      // Default: students
      return (data as StudentLeaderboardEntry[])
        .map((item, index) => {
          const isAnonymous = !item.full_name || item.full_name.trim() === "";
          const id = isAnonymous
            ? `anon-${index}`
            : `${item.full_name}-${item.institution || ""}-${item.total_karma}`;

          if (!isAnonymous && seenIds.has(id)) return null;
          if (!isAnonymous) seenIds.add(id);

          const entry: LeaderboardEntry = {
            id,
            rank: index + 1,
            name: isAnonymous ? "" : item.full_name,
            karma: item.total_karma,
          };

          if (item.profile_pic) {
            entry.profile_pic = item.profile_pic;
          }

          return entry;
        })
        .filter((item): item is LeaderboardEntry => item !== null);
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
