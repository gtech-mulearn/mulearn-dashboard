/**
 * usePublicUserJourney Hook
 *
 * 📍 src/features/mujourney/hooks/usePublicUserJourney.ts
 *
 * Hook for fetching a public user's journey by MUID.
 * Uses publicApiClient so unauthenticated requests do not send a Bearer token.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPublicUserJourney } from "../api";
import { mujourneyKeys } from "./query-keys";

/**
 * Hook for fetching public user journey by MUID
 * @param muid - User's MUID
 */
export function usePublicUserJourney(muid: string) {
  return useQuery({
    queryKey: mujourneyKeys.publicUserJourney(muid),
    queryFn: () => fetchPublicUserJourney(muid),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!muid,
  });
}
