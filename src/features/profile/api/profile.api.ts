/**
 * Profile API Functions
 *
 * 📍 src/features/profile/api/profile.api.ts
 *
 * All profile-related API calls with Zod validation.
 * Returns the inner response data (not the wrapper).
 */

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  type InterestGroupsListData,
  InterestGroupsListResponseSchema,
  type Socials,
  SocialsResponseSchema,
  type TogglePublicProfileRequest,
  type UserLevelsData,
  UserLevelsResponseSchema,
  type UserLogData,
  UserLogResponseSchema,
  type UserPreferences,
  UserPreferencesResponseSchema,
  type UserProfile,
  UserProfileResponseSchema,
  EmptyResponseSchema,
} from "../schemas";

// ============================================
// User Profile
// ============================================

/** Get current user's full profile */
export async function getUserProfile(): Promise<UserProfile> {
  const response = await apiClient.get(
    endpoints.user.profile,
    UserProfileResponseSchema,
  );
  return response.response;
}

/** Get public user profile by muid */
export async function getPublicUserProfile(muid: string): Promise<UserProfile> {
  const response = await apiClient.get(
    endpoints.user.publicProfile(muid),
    UserProfileResponseSchema,
  );
  return response.response;
}

// ============================================
// User Activity Log
// ============================================

/** Get current user's activity log */
export async function getUserLog(): Promise<UserLogData> {
  const response = await apiClient.get(
    endpoints.user.log,
    UserLogResponseSchema,
  );
  return response.response;
}

/** Get public user's activity log */
export async function getPublicUserLog(muid: string): Promise<UserLogData> {
  const response = await apiClient.get(
    endpoints.user.publicLog(muid),
    UserLogResponseSchema,
  );
  return response.response;
}

// ============================================
// User Levels
// ============================================

/** Get current user's level progress */
export async function getUserLevels(): Promise<UserLevelsData> {
  const response = await apiClient.get(
    endpoints.user.levels,
    UserLevelsResponseSchema,
  );
  return response.response;
}

/** Get public user's level progress */
export async function getPublicUserLevels(
  muid: string,
): Promise<UserLevelsData> {
  const response = await apiClient.get(
    endpoints.user.publicLevels(muid),
    UserLevelsResponseSchema,
  );
  return response.response;
}

// ============================================
// Socials
// ============================================

/** Get user's social links */
export async function getSocials(): Promise<Socials> {
  const response = await apiClient.get(
    endpoints.user.socials,
    SocialsResponseSchema,
  );
  return response.response;
}

/** Update user's social links */
export async function updateSocials(socials: Partial<Socials>): Promise<void> {
  await apiClient.put(endpoints.user.socialsEdit, socials, EmptyResponseSchema);
}

// ============================================
// Profile Settings
// ============================================

/** Toggle profile public/private */
export async function togglePublicProfile(
  data: TogglePublicProfileRequest,
): Promise<void> {
  await apiClient.put(endpoints.user.shareProfile, data, EmptyResponseSchema);
}

/** Get user preferences */
export async function getUserPreferences(): Promise<UserPreferences> {
  const response = await apiClient.get(
    endpoints.user.preferences,
    UserPreferencesResponseSchema,
  );
  return response.response;
}

/** Update user preferences */
export async function updateUserPreferences(
  preferences: Partial<UserPreferences>,
): Promise<void> {
  await apiClient.patch(
    endpoints.user.preferences,
    preferences,
    EmptyResponseSchema,
  );
}

// ============================================
// Profile Updates
// ============================================

/** Update profile image */
export async function updateProfileImage(imageUrl: string): Promise<void> {
  await apiClient.post(
    endpoints.user.updateProfileImage,
    { profile_pic: imageUrl },
    EmptyResponseSchema,
  );
}

// ============================================
// Interest Groups
// ============================================

/** Get list of all interest groups */
export async function getInterestGroupsList(): Promise<InterestGroupsListData> {
  const response = await apiClient.get(
    endpoints.dashboard.interestGroups,
    InterestGroupsListResponseSchema,
  );
  return response.response;
}

/** Update user's interest groups */
export async function updateInterestGroups(groupIds: string[]): Promise<void> {
  await apiClient.patch(
    endpoints.user.interestGroups,
    { interest_group: groupIds },
    EmptyResponseSchema,
  );
}
