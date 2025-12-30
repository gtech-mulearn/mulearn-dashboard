/**
 * Profile Query Keys
 *
 * 📍 src/features/profile/hooks/query-keys.ts
 *
 * Centralized query keys for consistent caching and invalidation.
 */

export const profileKeys = {
  all: ["profile"] as const,

  // User profile
  profile: () => [...profileKeys.all, "user-profile"] as const,
  publicProfile: (muid: string) =>
    [...profileKeys.all, "public-profile", muid] as const,

  // Activity log
  log: () => [...profileKeys.all, "log"] as const,
  publicLog: (muid: string) =>
    [...profileKeys.all, "public-log", muid] as const,

  // Levels
  levels: () => [...profileKeys.all, "levels"] as const,
  publicLevels: (muid: string) =>
    [...profileKeys.all, "public-levels", muid] as const,

  // Socials
  socials: () => [...profileKeys.all, "socials"] as const,

  // Preferences
  preferences: () => [...profileKeys.all, "preferences"] as const,

  // Interest Groups
  interestGroups: () => [...profileKeys.all, "interest-groups"] as const,
};
