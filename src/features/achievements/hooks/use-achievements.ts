"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAchievementProgress,
  fetchAchievements,
  fetchAllAchievementsForUser,
  fetchEligibleAchievements,
  fetchRules,
  fetchSingleRule,
  fetchUserAchievements,
  simulateForUser,
} from "../api";

// ==========================================
// Query Key Constants (inline — no separate file)
// ==========================================

export const ACHIEVEMENT_KEYS = {
  all: ["achievements"] as const,
  list: () => [...ACHIEVEMENT_KEYS.all, "list"] as const,
  userList: (muid: string) =>
    [...ACHIEVEMENT_KEYS.all, "user-list", muid] as const,
  rules: () => [...ACHIEVEMENT_KEYS.all, "rules"] as const,
  simulation: (muid: string) =>
    [...ACHIEVEMENT_KEYS.all, "simulation", muid] as const,
  auditLogs: (muid: string) =>
    [...ACHIEVEMENT_KEYS.all, "audit", muid] as const,
  issuedLogsAll: () => [...ACHIEVEMENT_KEYS.all, "issued-logs"] as const,
  issuedLogs: (
    page: number,
    perPage: number,
    search?: string,
    sortBy?: string,
    sortOrder?: string,
  ) =>
    [
      ...ACHIEVEMENT_KEYS.all,
      "issued-logs",
      { page, perPage, search, sortBy, sortOrder },
    ] as const,
  eligible: () => [...ACHIEVEMENT_KEYS.all, "eligible"] as const,
  progress: () => [...ACHIEVEMENT_KEYS.all, "progress"] as const,
  allForUser: (userId: string) =>
    [...ACHIEVEMENT_KEYS.all, "all-for-user", userId] as const,
  singleRule: (ruleId: string) =>
    [...ACHIEVEMENT_KEYS.all, "rule", ruleId] as const,
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
// useUserAchievements — list achievements for a specific user
// ==========================================

export function useUserAchievements(muid: string) {
  return useQuery({
    queryKey: ACHIEVEMENT_KEYS.userList(muid),
    queryFn: () => fetchUserAchievements(muid),
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

// ==========================================
// useAllAchievementsForUser
// Returns ALL achievements with has_achievement: true/false per item.
// Correct endpoint for Issue/Revoke panel — uses GET /list/?user_id=<uuid>
// ==========================================

export function useAllAchievementsForUser(userId: string) {
  return useQuery({
    queryKey: ACHIEVEMENT_KEYS.allForUser(userId),
    queryFn: () => fetchAllAchievementsForUser(userId),
    enabled: Boolean(userId),
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ==========================================
// useSingleRule
// Fetches full detail of a single rule (GET /rules/<rule_id>/)
// ==========================================

export function useSingleRule(ruleId: string | null) {
  return useQuery({
    queryKey: ACHIEVEMENT_KEYS.singleRule(ruleId ?? ""),
    queryFn: () => fetchSingleRule(ruleId!),
    enabled: Boolean(ruleId),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ==========================================
// useEligibleAchievements
// ==========================================

export function useEligibleAchievements() {
  return useQuery({
    queryKey: ACHIEVEMENT_KEYS.eligible(),
    queryFn: fetchEligibleAchievements,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ==========================================
// useAchievementProgress
// ==========================================

export function useAchievementProgress() {
  return useQuery({
    queryKey: ACHIEVEMENT_KEYS.progress(),
    queryFn: fetchAchievementProgress,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
