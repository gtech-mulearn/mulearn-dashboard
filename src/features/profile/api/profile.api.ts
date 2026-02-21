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
  type ConnectedDIDsData,
  ConnectedDIDsResponseSchema,
  EmptyResponseSchema,
  type InterestGroupsListData,
  InterestGroupsListResponseSchema,
  type IssuedVC,
  IssuedVCResponseSchema,
  type Socials,
  SocialsResponseSchema,
  type TogglePublicProfileRequest,
  type UserAchievementsData,
  UserAchievementsResponseSchema,
  type UserLevelsData,
  UserLevelsResponseSchema,
  type UserLogData,
  UserLogResponseSchema,
  type UserPreferences,
  UserPreferencesResponseSchema,
  type UserProfile,
  UserProfileResponseSchema,
  type VCCredentialInfo,
  type VCSubjectInfo,
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

// ============================================
// Achievements
// ============================================

/** Get user achievements by muid */
export async function getUserAchievements(
  muid: string,
): Promise<UserAchievementsData> {
  const response = await apiClient.get(
    endpoints.achievements.userAchievements(muid),
    UserAchievementsResponseSchema,
  );
  return response.response;
}

/** Get connected DIDs for user */
export async function getConnectedDIDs(
  muid: string,
): Promise<ConnectedDIDsData> {
  const response = await apiClient.get(
    endpoints.qseverse.connectedUsers(muid),
    ConnectedDIDsResponseSchema,
  );
  return response.response;
}

/** Issue Verifiable Credential */
export async function issueVC(
  subjectInfo: VCSubjectInfo,
  credentialInfo: VCCredentialInfo,
  templateId: string,
): Promise<IssuedVC[]> {
  const response = await apiClient.post(
    endpoints.qseverse.issueVC,
    {
      subject_info: subjectInfo,
      credential_info: credentialInfo,
      template_id: templateId,
      send_email: true,
    },
    IssuedVCResponseSchema,
  );
  return response.response;
}

/** Update VC URL after issuance */
export async function updateVCURL(
  achievementId: string,
  vcUrl: string,
): Promise<void> {
  await apiClient.post(
    endpoints.achievements.issueVC,
    {
      achievement_id: achievementId,
      vc_url: vcUrl,
    },
    EmptyResponseSchema,
  );
}
