/**
 * School search hook
 *
 * 📍 src/features/onboarding/hooks/use-schools.ts
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { searchSchools } from "../api";
import { onboardingKeys } from "./query-keys";

/**
 * Server-side school search by name, same pattern as useCollegeSearch.
 */
export function useSchoolSearch(search: string, enabled = true) {
  const debouncedSearch = useDebounce(search, 300);

  return useQuery({
    queryKey: onboardingKeys.schoolSearch(debouncedSearch),
    queryFn: async () => {
      const response = await searchSchools(debouncedSearch);
      return response.response.data;
    },
    enabled,
    staleTime: 60 * 1000,
  });
}
