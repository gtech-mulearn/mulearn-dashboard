/**
 * College Search Hook (server-side search)
 *
 * 📍 src/features/settings/hooks/use-college-search.ts
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { searchColleges } from "@/features/settings";
import { settingsKeys } from "./query-key";

/**
 * Hook for server-side searching colleges by name.
 * Debounces the query and only hits the API once 2+ chars are typed.
 */
export function useCollegeSearch(search: string) {
  const debouncedSearch = useDebounce(search, 300);

  return useQuery({
    queryKey: settingsKeys.collegeSearch(debouncedSearch),
    queryFn: async () => {
      const res = await searchColleges(debouncedSearch);
      return res.response.data;
    },
    enabled: debouncedSearch.trim().length >= 2,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
}
