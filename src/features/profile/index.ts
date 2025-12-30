/**
 * Profile Feature Index
 *
 * 📍 src/features/profile/index.ts
 *
 * Public API for the profile feature.
 */

// API
export * from "./api";

// Hooks
export * from "./hooks";

// Schemas (explicit exports to avoid conflicts)
export {
  InterestGroupSchema,
  type InterestGroup,
  KarmaDistributionSchema,
  type KarmaDistribution as KarmaDistributionData,
  UserProfileSchema,
  type UserProfile,
  UserLogEntrySchema,
  type UserLogEntry,
  UserLogDataSchema,
  type UserLogData,
  UserLogResponseSchema,
  type UserLogResponse,
  LevelTaskSchema,
  type LevelTask,
  UserLevelSchema,
  type UserLevel,
  UserLevelsDataSchema,
  type UserLevelsData,
  UserLevelsResponseSchema,
  type UserLevelsResponse,
  SocialsSchema,
  type Socials,
  UserPreferencesSchema,
  type UserPreferences,
  UpdateProfileRequestSchema,
  type UpdateProfileRequest,
  TogglePublicProfileRequestSchema,
  type TogglePublicProfileRequest,
} from "./schemas";

// Components
export * from "./components";
