/**
 * Leaderboard Hook
 *
 * 📍 src/features/leaderboard/hooks/use-leaderboard.ts
 *
 * TanStack Query for fetching leaderboard data.
 */

"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchCampusLeaderboard, fetchStudentLeaderboard } from "../api";
import type {
  CollegeLeaderboardEntry,
  StudentLeaderboardEntry,
} from "../schemas";
import type { Category, LeaderboardEntry, TimeFrame } from "../types";
import { leaderboardKeys } from "./query-keys";

export function useLeaderboard(category: Category, timeframe: TimeFrame) {
  const monthly = timeframe === "monthly";

  return useQuery({
    queryKey:
      category === "campus"
        ? leaderboardKeys.college(monthly)
        : leaderboardKeys.students(monthly),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      if (category === "campus") return await fetchCampusLeaderboard(monthly);
      return await fetchStudentLeaderboard(monthly);
    },
    select: (
      data: StudentLeaderboardEntry[] | CollegeLeaderboardEntry[],
    ): LeaderboardEntry[] => {
      if (!data || !Array.isArray(data)) return [];

      const seenIds = new Set<string>();

      if (category === "campus") {
        return (data as CollegeLeaderboardEntry[])
          .map((item, index) => {
            const id = item.id || item.code || `college-${index}`;
            if (seenIds.has(id)) return null;
            seenIds.add(id);

            const entry: LeaderboardEntry = {
              id,
              rank: index + 1,
              name: item.title || item.code,
              karma: item.total_karma,
              link: item.id ? `/dashboard/campus/${item.id}` : undefined,
            };

            return entry;
          })
          .filter((item): item is LeaderboardEntry => item !== null);
      }

      // Default: students
      return (data as StudentLeaderboardEntry[])
        .map((item, index) => {
          const isAnonymous = !item.full_name || item.full_name.trim() === "";
          const id = item.muid
            ? item.muid
            : isAnonymous
              ? `anon-${index}`
              : `${item.full_name}-${item.institution || ""}-${item.total_karma}`;

          if (!isAnonymous && item.muid && seenIds.has(id)) return null;
          if (!isAnonymous && item.muid) seenIds.add(id);

          const entry: LeaderboardEntry = {
            id,
            rank: index + 1,
            name: isAnonymous ? "" : item.full_name,
            karma: item.total_karma,
            link: item.muid ? `/profile/${item.muid}` : undefined,
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
