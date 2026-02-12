/**
 * Colleges Hook
 *
 * 📍 src/features/onboarding/hooks/use-colleges.ts
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { onboardingKeys } from "@/features/onboarding/hooks/query-keys";
import { getColleges } from "@/features/settings";

/**
 * Hook for fetching list of colleges
 */
export function useColleges() {
  return useQuery({
    queryKey: onboardingKeys.colleges(),
    queryFn: async () => {
      const response = await getColleges();
      return response.response.colleges;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
}
