/**
 * MuJourney Query Keys
 *
 * 📍 src/features/mujourney/hooks/query-keys.ts
 *
 * Centralized query keys for TanStack Query
 */

export const mujourneyKeys = {
  all: ["mujourney"] as const,

  // Start Learning tab
  userLevels: () => [...mujourneyKeys.all, "user-levels"] as const,
  publicLevels: () => [...mujourneyKeys.all, "public-levels"] as const,

  // Become Expert tab
  igTasks: (igId: string) => [...mujourneyKeys.all, "ig-tasks", igId] as const,

  // Public journey
  publicUserJourney: (muid: string) =>
    [...mujourneyKeys.all, "public-journey", muid] as const,

  // Interest groups
  interestGroups: () => [...mujourneyKeys.all, "interest-groups"] as const,

  // User feed
  userLevelFeed: () => [...mujourneyKeys.all, "user-level-feed"] as const,
} as const;
