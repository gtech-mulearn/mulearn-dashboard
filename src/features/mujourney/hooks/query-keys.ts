/**
 * MuJourney Query Keys
 *
 * 📍 src/features/mujourney/hooks/query-keys.ts
 *
 * Centralized query keys for TanStack Query
 */

export const mujourneyKeys = {
  all: ["mujourney"] as const,

  // Unified task list (redesigned API)
  // authenticated is part of the key so an authed "no IG selected" fetch never
  // shares a cache slot with an actual unauthenticated visitor's fetch.
  taskList: (igId?: string, authenticated?: boolean) =>
    [
      ...mujourneyKeys.all,
      "task-list",
      authenticated ? "auth" : "public",
      igId ?? "all",
    ] as const,

  // Prefix key matching ALL task-list queries regardless of igId/auth — use for invalidation
  taskListAll: () => [...mujourneyKeys.all, "task-list"] as const,

  // Public journey (for [muid] page)
  publicUserJourney: (muid: string) =>
    [...mujourneyKeys.all, "public-journey", muid] as const,

  // Interest groups (for IG pill labels)
  interestGroups: () => [...mujourneyKeys.all, "interest-groups"] as const,

  // User level feed (for progress bar)
  userLevelFeed: () => [...mujourneyKeys.all, "user-level-feed"] as const,
} as const;
