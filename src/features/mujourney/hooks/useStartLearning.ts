/**
 * Start Learning Hook
 *
 * 📍 src/features/mujourney/hooks/useStartLearning.ts
 *
 * Hook for Start Learning tab - foundation tasks
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { authStore } from "@/lib/auth";
import { fetchPublicLevels, fetchUserLevels } from "../api";
import type { GetUserLevelsResponse } from "../schemas";
import { mujourneyKeys } from "./query-keys";

/**
 * Hook for logged-in users - shows unlocked levels first
 */
export function useUserLevels(initialData?: GetUserLevelsResponse | null) {
  const isAuthenticated = authStore.isAuthenticated();

  return useQuery({
    queryKey: mujourneyKeys.userLevels(),
    queryFn: () => fetchUserLevels(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated,
    initialData: initialData || undefined,
  });
}

/**
 * Hook for public users - shows all levels
 */
export function usePublicLevels() {
  const isAuthenticated = authStore.isAuthenticated();

  return useQuery({
    queryKey: mujourneyKeys.publicLevels(),
    queryFn: fetchPublicLevels,
    staleTime: 10 * 60 * 1000, // 10 minutes (public data changes less)
    enabled: !isAuthenticated,
  });
}

/**
 * Combined hook that uses appropriate endpoint based on auth state
 */
export function useStartLearning(initialData?: GetUserLevelsResponse | null) {
  const { isAuthenticated } = useAuth();
  const userLevelsQuery = useUserLevels(initialData);
  const publicLevelsQuery = usePublicLevels();

  return isAuthenticated ? userLevelsQuery : publicLevelsQuery;
}
