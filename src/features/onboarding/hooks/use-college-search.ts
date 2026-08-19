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
 * Debounces the query; fetches immediately (even with an empty search) so
 * the combobox shows suggestions as soon as it opens, matching the
 * Organization Name combobox's behavior.
 */
export function useCollegeSearch(search: string) {
  const debouncedSearch = useDebounce(search, 300);

  return useQuery({
    queryKey: onboardingKeys.collegeSearch(debouncedSearch),
    queryFn: async () => {
      const response = await searchColleges(debouncedSearch);
      return response.response.data;
    },
    staleTime: 60 * 1000,
  });
}
