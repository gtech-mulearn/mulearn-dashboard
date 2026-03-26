/**
 * usePendingCounts Hook
 *
 * 📍 src/features/discord-moderation/hooks/use-pending-counts.ts
 *
 * TanStack Query wrapper for peer / appraiser pending approval counts.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPendingCounts } from "../api";
import { discordModerationKeys } from "./query-keys";

export function getPendingCountsQueryOptions(date?: string) {
  return {
    queryKey: discordModerationKeys.pendingCounts(date),
    queryFn: () => fetchPendingCounts(date),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  } as const;
}

export function usePendingCounts(date?: string) {
  return useQuery(getPendingCountsQueryOptions(date));
}
