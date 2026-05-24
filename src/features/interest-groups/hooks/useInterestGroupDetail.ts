/**
 * Interest Group Detail Hook
 *
 * 📍 src/features/interest-groups/hooks/useInterestGroupDetail.ts
 *
 * Hook for fetching details of a specific interest group.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { getInterestGroupDetail } from "../api";
import { igKeys } from "./query-keys";

export function useInterestGroupDetail(id: string) {
  return useQuery({
    queryKey: igKeys.detail(id),
    queryFn: () => getInterestGroupDetail(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}
