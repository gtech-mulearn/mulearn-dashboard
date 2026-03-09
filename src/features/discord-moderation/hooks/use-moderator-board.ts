/**
 * useModeratorBoard Hook
 *
 * 📍 src/features/discord-moderation/hooks/use-moderator-board.ts
 *
 * TanStack Query wrapper for the moderator leaderboard.
 */

"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchModeratorLeaderboard, type LeaderboardParams } from "../api";
import { discordModerationKeys } from "./query-keys";

export function getModeratorBoardQueryOptions(params: LeaderboardParams) {
  return {
    queryKey: discordModerationKeys.leaderboard(params),
    queryFn: () => fetchModeratorLeaderboard(params),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  } as const;
}

export function useModeratorBoard(params: LeaderboardParams) {
  return useQuery(getModeratorBoardQueryOptions(params));
}
