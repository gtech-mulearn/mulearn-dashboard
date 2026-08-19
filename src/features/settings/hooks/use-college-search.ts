/**
 * College Search Hook (server-side search)
 *
 * 📍 src/features/settings/hooks/use-college-search.ts
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { searchColleges } from "@/features/settings";
import { useDebounce } from "@/hooks/use-debounce";
import { settingsKeys } from "./query-key";

/**
 * Hook for server-side searching colleges by name.
 * Debounces the query; fetches immediately (even with an empty search) so
 * the combobox shows suggestions as soon as it opens.
 */
export function useCollegeSearch(search: string) {
  const debouncedSearch = useDebounce(search, 300);

  return useQuery({
    queryKey: settingsKeys.collegeSearch(debouncedSearch),
    queryFn: async () => {
      const res = await searchColleges(debouncedSearch);
      return res.response.data;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
}
