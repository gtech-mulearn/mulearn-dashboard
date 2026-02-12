/**
 * Become Expert Hook
 *
 * 📍 src/features/mujourney/hooks/useBecomeExpert.ts
 *
 * Hook for Become Expert tab - Interest Group tasks
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchIGTasks } from "../api";
import { mujourneyKeys } from "./query-keys";

/**
 * Hook for fetching Interest Group tasks
 * @param igId - Interest Group ID
 * @param perPage - Items per page
 */
export function useIGTasks(igId: string, perPage = 20) {
  return useQuery({
    queryKey: mujourneyKeys.igTasks(igId || ""),
    queryFn: () => fetchIGTasks(igId || "", perPage),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: igId !== "", // Only fetch if igId is provided
  });
}
