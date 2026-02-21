"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAchievements, fetchRules, simulateForUser } from "../api";

// ==========================================
// Query Key Constants (inline — no separate file)
// ==========================================

export const ACHIEVEMENT_KEYS = {
  all: ["achievements"] as const,
  list: () => [...ACHIEVEMENT_KEYS.all, "list"] as const,
  rules: () => [...ACHIEVEMENT_KEYS.all, "rules"] as const,
  simulation: (muid: string) =>
    [...ACHIEVEMENT_KEYS.all, "simulation", muid] as const,
  auditLogs: (muid: string) =>
    [...ACHIEVEMENT_KEYS.all, "audit", muid] as const,
  issuedLogsAll: () => [...ACHIEVEMENT_KEYS.all, "issued-logs"] as const,
  issuedLogs: (page: number, perPage: number, search?: string) =>
    [
      ...ACHIEVEMENT_KEYS.all,
      "issued-logs",
      { page, perPage, search },
    ] as const,
} as const;

// ==========================================
// useAchievements — list all achievements
// ==========================================

export function useAchievements() {
  return useQuery({
    queryKey: ACHIEVEMENT_KEYS.list(),
    queryFn: fetchAchievements,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ==========================================
// useAchievementRules — list all rules
// ==========================================

export function useAchievementRules() {
  return useQuery({
    queryKey: ACHIEVEMENT_KEYS.rules(),
    queryFn: fetchRules,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ==========================================
// useSimulation — simulate achievements for a MUID
// ==========================================

export function useSimulation(muid: string) {
  return useQuery({
    queryKey: ACHIEVEMENT_KEYS.simulation(muid),
    queryFn: () => simulateForUser(muid),
    enabled: Boolean(muid),
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ==========================================
// useAchievementQueryClient — helper to expose queryClient
// ==========================================

export function useAchievementQueryClient() {
  return useQueryClient();
}
