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
  fetchCampusMentorLeaderboard,
  fetchIgMentorLeaderboard,
  fetchMentorLeaderboard,
  fetchStudentLeaderboard,
  fetchWadhwaniLeaderboard,
} from "./api";

// Components
export {
  CategorySelector,
  LeaderboardCard,
  LeaderboardControls,
  LeaderboardView,
  Podium,
  TimeFrameToggle,
  WadhwaniTimeFrameToggle,
} from "./components";

// Hooks (primary way to use the feature)
export { useLeaderboard } from "./hooks";

// Schemas and types
export {
  ApiResponseSchema,
  CampusMentorLeaderboardEntrySchema,
  CampusMentorLeaderboardResponseSchema,
  CollegeLeaderboardEntrySchema,
  CollegeLeaderboardResponseSchema,
  IgMentorLeaderboardEntrySchema,
  IgMentorLeaderboardResponseSchema,
  MentorLeaderboardEntrySchema,
  MentorLeaderboardResponseSchema,
  StudentLeaderboardEntrySchema,
  StudentLeaderboardResponseSchema,
  WadhwaniLeaderboardEntrySchema,
  WadhwaniLeaderboardResponseSchema,
} from "./schemas";

export type {
  CampusMentorLeaderboardEntry,
  CollegeLeaderboardEntry,
  CollegeLeaderboardResponse,
  IgMentorLeaderboardEntry,
  MentorLeaderboardEntry,
  StudentLeaderboardEntry,
  StudentLeaderboardResponse,
  WadhwaniLeaderboardEntry,
  WadhwaniLeaderboardResponse,
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
  WadhwaniTimeFrame,
  WadhwaniToggleProps,
} from "./types";
