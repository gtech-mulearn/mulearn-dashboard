/**
 * Leaderboard Feature
 *
 * 📍 src/features/leaderboard/index.ts
 *
 * Public API for the leaderboard feature.
 * Import from here, not from internal files.
 */

// API functions (for direct use if needed)
export {
  fetchCampusLeaderboard,
  fetchStudentLeaderboard,
} from "./api";

// Components
export {
  CategorySelector,
  LeaderboardCard,
  LeaderboardControls,
  LeaderboardView,
  Podium,
  TimeFrameToggle,
} from "./components";

// Hooks (primary way to use the feature)
export { useLeaderboard } from "./hooks";
export type {
  CollegeLeaderboardEntry,
  CollegeLeaderboardResponse,
  StudentLeaderboardEntry,
  StudentLeaderboardResponse,
} from "./schemas";
// Schemas and types
export {
  ApiResponseSchema,
  CollegeLeaderboardEntrySchema,
  CollegeLeaderboardResponseSchema,
  StudentLeaderboardEntrySchema,
  StudentLeaderboardResponseSchema,
} from "./schemas";

// Types
export type {
  Category,
  CategorySelectorProps,
  GeneralToggleProps,
  LeaderboardCardProps,
  LeaderboardData,
  LeaderboardEntry,
  PodiumProps,
  TimeFrame,
} from "./types";
