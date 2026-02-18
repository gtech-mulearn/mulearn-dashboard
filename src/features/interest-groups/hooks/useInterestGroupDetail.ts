/**
 * Interest Group Detail Hook
 *
 * 📍 src/features/interest-groups/hooks/useInterestGroupDetail.ts
 *
 * Hook for fetching details of a specific interest group.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { authStore } from "@/lib/auth";
import { getInterestGroupDetail } from "../api";

export function useInterestGroupDetail(id: string) {
  const isAuthenticated = !!authStore.getAccessToken();

  return useQuery({
    queryKey: ["interest-group-detail", id],
    queryFn: () => getInterestGroupDetail(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated && !!id,
  });
}
