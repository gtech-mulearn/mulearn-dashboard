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

// The signed-in dashboard's list (useDashboardInterestGroups). Its key keeps the value it had in
// the home feature, so moving it (issue 0010) changed no caching, and invalidating igKeys.all
// doesn't refetch it.
export const dashboardIgKeys = {
  list: () => ["home", "interest-groups"] as const,
} as const;
