/**
 * Departments Hook
 *
 * 📍 src/features/onboarding/hooks/use-departments.ts
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDepartments } from "../api";
import { onboardingKeys } from "./query-keys";

/**
 * Hook for fetching list of departments
 */
export function useDepartments() {
  return useQuery({
    queryKey: onboardingKeys.departments(),
    queryFn: async () => {
      const response = await fetchDepartments();
      return response.response.departments;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
}
