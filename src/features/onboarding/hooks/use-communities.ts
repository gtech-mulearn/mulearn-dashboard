/**
 * Communities Hook
 *
 * 📍 src/features/onboarding/hooks/use-communities.ts
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCommunities } from "../api";
import { onboardingKeys } from "./query-keys";

/**
 * Hook for fetching list of communities
 */
export function useCommunities() {
  return useQuery({
    queryKey: onboardingKeys.communities(),
    queryFn: async () => {
      const response = await fetchCommunities();
      return response.response.communities;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
}
