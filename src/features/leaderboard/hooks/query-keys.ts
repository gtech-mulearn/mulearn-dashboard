/**
 * Leaderboard Query Keys
 *
 * 📍 src/features/leaderboard/hooks/query-keys.ts
 */

export const leaderboardKeys = {
  all: ["leaderboard"] as const,
  students: (monthly: boolean) =>
    [...leaderboardKeys.all, "students", { monthly }] as const,
  college: (monthly: boolean) =>
    [...leaderboardKeys.all, "college", { monthly }] as const,
  wadhwani: (campus: boolean) =>
    [...leaderboardKeys.all, "wadhwani", { campus }] as const,
};
