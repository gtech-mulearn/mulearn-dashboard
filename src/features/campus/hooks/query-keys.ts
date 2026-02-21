/**
 * Campus Query Keys
 *
 * 📍 src/features/campus/hooks/query-keys.ts
 *
 * Centralized query keys for TanStack Query
 */

export const campusKeys = {
  all: ["campus"] as const,
  info: (id: string) => [...campusKeys.all, "info", id] as const,
  weeklyKarma: (id: string) => [...campusKeys.all, "weekly-karma", id] as const,
} as const;
