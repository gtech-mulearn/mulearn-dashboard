/**
 * College Search Hook (server-side search)
 *
 * 📍 src/features/onboarding/hooks/use-college-search.ts
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { searchColleges } from "../api";
import { onboardingKeys } from "./query-keys";

/**
 * Hook for server-side searching colleges by name.
 * Debounces the query and only hits the API once 2+ chars are typed.
 */
export function useCollegeSearch(search: string) {
  const debouncedSearch = useDebounce(search, 300);

  return useQuery({
    queryKey: onboardingKeys.collegeSearch(debouncedSearch),
    queryFn: async () => {
      const response = await searchColleges(debouncedSearch);
      return response.response.data;
    },
    enabled: debouncedSearch.trim().length >= 2,
    staleTime: 60 * 1000,
  });
}
