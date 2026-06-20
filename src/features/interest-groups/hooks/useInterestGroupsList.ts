/**
 * Interest Groups List Hook
 *
 * 📍 src/features/interest-groups/hooks/useInterestGroupsList.ts
 *
 * Hook for fetching the list of all interest groups.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { authStore } from "@/lib/auth";
import { getInterestGroupsList } from "../api";
import { igKeys } from "./query-keys";

export function useInterestGroupsList(orderBy?: string) {
  const isAuthenticated = authStore.isAuthenticated();

  return useQuery({
    queryKey: igKeys.list(orderBy),
    queryFn: () => getInterestGroupsList(orderBy),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated,
  });
}
