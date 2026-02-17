/**
 * User Journey Hook
 *
 * 📍 src/features/mujourney/hooks/useUserJourney.ts
 *
 * Hook for public user journey view
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPublicUserJourney } from "../api";
import { mujourneyKeys } from "./query-keys";

/**
 * Hook for fetching public user journey by MUID
 * @param muid - User's MUID
 */
export function useUserJourney(muid: string) {
  return useQuery({
    queryKey: mujourneyKeys.publicUserJourney(muid),
    queryFn: () => fetchPublicUserJourney(muid),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!muid,
  });
}
