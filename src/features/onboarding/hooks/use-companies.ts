/**
 * Companies Hook
 *
 * 📍 src/features/onboarding/hooks/use-companies.ts
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCompanies } from "../api";
import { onboardingKeys } from "./query-keys";

/**
 * Hook for fetching list of companies
 */
export function useCompanies() {
  return useQuery({
    queryKey: onboardingKeys.companies(),
    queryFn: async () => {
      const response = await fetchCompanies();
      return response.response.data;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
}
