/**
 * Department Search Hook (server-side search)
 *
 * 📍 src/features/settings/hooks/use-department-search.ts
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { searchDepartments } from "@/features/settings";
import { useDebounce } from "@/hooks/use-debounce";
import { settingsKeys } from "./query-key";

/**
 * Hook for server-side searching departments by name.
 * Debounces the query and only hits the API once 2+ chars are typed.
 */
export function useDepartmentSearch(search: string) {
  const debouncedSearch = useDebounce(search, 300);

  return useQuery({
    queryKey: settingsKeys.departmentSearch(debouncedSearch),
    queryFn: async () => {
      const res = await searchDepartments(debouncedSearch);
      return res.response.departments;
    },
    enabled: debouncedSearch.trim().length >= 2,
    staleTime: 10 * 60 * 1000,
  });
}
