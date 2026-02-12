/**
 * Departments Hook
 *
 * 📍 src/features/settings/hooks/use-department.ts
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { getDepartments } from "@/features/settings";
import { settingsKeys } from "./query-key";

/**
 * Hook for fetching list of departments
 */
export function useDepartments() {
  return useQuery({
    queryKey: settingsKeys.departments(),
    queryFn: async () => {
      const response = await getDepartments();
      return response.response.departments;
    },
    staleTime: 10 * 60 * 1000,
  });
}
