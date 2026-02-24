/**
 * Interest Groups Query Keys
 *
 * 📍 src/features/interest-groups/hooks/query-keys.ts
 *
 * Centralized query keys for TanStack Query
 */

export const igKeys = {
  all: ["interest-groups"] as const,
  list: (orderBy?: string) => [...igKeys.all, "list", orderBy] as const,
  detail: (id: string) => [...igKeys.all, "detail", id] as const,
} as const;
