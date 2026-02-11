/**
 * Profile Feature Index
 *
 * 📍 src/features/profile/index.ts
 *
 * Public API for the profile feature.
 */

// API
export * from "./api";
// Components
export * from "./components";
// Hooks
export * from "./hooks";
// Schemas (explicit exports to avoid conflicts)
export {
  type InterestGroup,
  InterestGroupSchema,
  type KarmaDistribution as KarmaDistributionData,
  KarmaDistributionSchema,
  type LevelTask,
  LevelTaskSchema,
  type Socials,
  SocialsSchema,
  type TogglePublicProfileRequest,
  TogglePublicProfileRequestSchema,
  type UpdateProfileRequest,
  UpdateProfileRequestSchema,
  type UserLevel,
  UserLevelSchema,
  type UserLevelsData,
  UserLevelsDataSchema,
  type UserLevelsResponse,
  UserLevelsResponseSchema,
  type UserLogData,
  UserLogDataSchema,
  type UserLogEntry,
  UserLogEntrySchema,
  type UserLogResponse,
  UserLogResponseSchema,
  type UserPreferences,
  UserPreferencesSchema,
  type UserProfile,
  UserProfileSchema,
} from "./schemas";
