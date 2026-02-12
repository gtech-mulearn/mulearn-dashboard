/**
 * User Level Feed Hook
 *
 * 📍 src/features/mujourney/hooks/useUserLevelFeed.ts
 *
 * Hook for user's task completion history
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { authStore } from "@/lib/auth";
import { fetchUserLevelFeed } from "../api";
import { mujourneyKeys } from "./query-keys";

/**
 * Hook for fetching user's level feed/history
 */
export function useUserLevelFeed() {
  const isAuthenticated = !!authStore.getAccessToken();

  return useQuery({
    queryKey: mujourneyKeys.userLevelFeed(),
    queryFn: fetchUserLevelFeed,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated,
  });
}
