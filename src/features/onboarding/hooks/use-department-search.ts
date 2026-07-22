/**
 * Department Search Hook (server-side search)
 *
 * 📍 src/features/onboarding/hooks/use-department-search.ts
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { searchDepartments } from "../api";
import { onboardingKeys } from "./query-keys";

/**
 * Hook for server-side searching departments by name.
 * Debounces the query and only hits the API once 2+ chars are typed.
 */
export function useDepartmentSearch(search: string) {
  const debouncedSearch = useDebounce(search, 300);

  return useQuery({
    queryKey: onboardingKeys.departmentSearch(debouncedSearch),
    queryFn: async () => {
      const response = await searchDepartments(debouncedSearch);
      return response.response.departments;
    },
    enabled: debouncedSearch.trim().length >= 2,
    staleTime: 60 * 1000,
  });
}
