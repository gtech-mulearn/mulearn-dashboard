/**
 * Colleges Hook
 *
 * 📍 src/features/onboarding/hooks/use-colleges.ts
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchColleges } from "../api";
import { onboardingKeys } from "./query-keys";

/**
 * Hook for fetching list of colleges
 */
export function useColleges() {
  return useQuery({
    queryKey: onboardingKeys.colleges(),
    queryFn: async () => {
      const response = await fetchColleges();
      return response.response.colleges;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
}
