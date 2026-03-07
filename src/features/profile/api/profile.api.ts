/**
 * Profile API Functions
 *
 * 📍 src/features/profile/api/profile.api.ts
 *
 * All profile-related API calls with Zod validation.
 * Returns the inner response data (not the wrapper).
 */

import { ApiError, apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { authStore } from "@/lib/auth";
import {
  CollegesByDistrictResponseSchema,
  CommunitiesResponseSchema,
  type ConnectedDIDsData,
  ConnectedDIDsResponseSchema,
  CountriesResponseSchema,
  DistrictsResponseSchema,
  type EditableProfile,
  EditableProfileResponseSchema,
  EmptyResponseSchema,
  type InterestGroupsListData,
  InterestGroupsListResponseSchema,
  type IssuedVC,
  IssuedVCResponseSchema,
  type LocationOption,
  type Option,
  SchoolsByDistrictResponseSchema,
  type Socials,
  SocialsResponseSchema,
  StatesResponseSchema,
  type TogglePublicProfileRequest,
  UpdateProfileImageResponseSchema,
  type UpdateProfileRequest,
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

/** Get editable profile payload for pre-filling edit form */
export async function getEditableUserProfile(): Promise<EditableProfile> {
  const response = await apiClient.get(
    endpoints.user.updateProfile,
    EditableProfileResponseSchema,
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
export async function updateProfile(data: UpdateProfileRequest): Promise<void> {
  await apiClient.patch(
    endpoints.user.updateProfile,
    data,
    EmptyResponseSchema,
  );
}

/** Update profile image (multipart/form-data) */
export async function updateProfileImage(
  profilePic: File,
  userId: string,
): Promise<void> {
  const token = authStore.getAccessToken();
  const formData = new FormData();
  formData.append("profile", profilePic);
  formData.append("user_id", userId);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}${endpoints.user.updateProfileImage}`,
    {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    },
  );

  const rawData = await response.json().catch(() => null);

  if (!response.ok || rawData?.hasError) {
    const message =
      rawData?.message?.general?.[0] ?? "Failed to update profile image";
    throw new ApiError(response.status, message, rawData);
  }

  const parsed = UpdateProfileImageResponseSchema.safeParse(rawData);
  if (!parsed.success) {
    throw new Error("Invalid API response");
  }
}

/** Sync discord profile image */
export async function syncDiscordProfileImage(): Promise<void> {
  await apiClient.patch(
    endpoints.user.updateProfileImage,
    {},
    EmptyResponseSchema,
  );
}

function toOption(item: Option): LocationOption {
  return {
    value: item.id,
    label: item.title ?? item.name ?? item.location ?? item.id,
  };
}

function sortOptions(options: LocationOption[]): LocationOption[] {
  return [...options].sort((a, b) => a.label.localeCompare(b.label));
}

/** List communities */
export async function getCommunities(): Promise<LocationOption[]> {
  const response = await apiClient.get(
    endpoints.onboarding.communities,
    CommunitiesResponseSchema,
  );
  return sortOptions(response.response.communities.map(toOption));
}

/** List countries */
export async function getCountries(): Promise<LocationOption[]> {
  const response = await apiClient.get(
    endpoints.location.countries,
    CountriesResponseSchema,
  );
  return sortOptions(
    response.response.countries.map((country) => ({
      value: country.id,
      label: country.name,
    })),
  );
}

/** List states for country */
export async function getStates(countryId: string): Promise<LocationOption[]> {
  if (!countryId) return [];
  const response = await apiClient.post(
    endpoints.location.states,
    { country: countryId },
    StatesResponseSchema,
  );
  return sortOptions(
    response.response.states.map((state) => ({
      value: state.id,
      label: state.name,
    })),
  );
}

/** List districts for state */
export async function getDistricts(stateId: string): Promise<LocationOption[]> {
  if (!stateId) return [];
  const response = await apiClient.post(
    endpoints.location.districts,
    { state: stateId },
    DistrictsResponseSchema,
  );
  return sortOptions(
    response.response.districts.map((district) => ({
      value: district.id,
      label: district.name,
    })),
  );
}

/** List colleges/schools + departments for district */
export async function getOrganizationsAndDepartments(
  districtId: string,
): Promise<{ organizations: LocationOption[]; departments: LocationOption[] }> {
  if (!districtId) {
    return { organizations: [], departments: [] };
  }

  const [collegesRes, schoolsRes] = await Promise.all([
    apiClient.post(
      endpoints.manageUsers.collegesByDistrict,
      { district: districtId },
      CollegesByDistrictResponseSchema,
    ),
    apiClient.post(
      endpoints.manageUsers.schoolsByDistrict,
      { district: districtId },
      SchoolsByDistrictResponseSchema,
    ),
  ]);

  const organizations = sortOptions([
    ...collegesRes.response.colleges.map((college) => ({
      value: college.id,
      label: college.title,
    })),
    ...schoolsRes.response.schools.map((school) => ({
      value: school.id,
      label: school.title,
    })),
  ]);

  const departments = sortOptions(
    collegesRes.response.departments.map((department) => ({
      value: department.id,
      label: department.title,
    })),
  );

  return {
    organizations,
    departments,
  };
}

export async function editCollege(
  org_id: string,
  department_id: string,
): Promise<void> {
  await apiClient.patch(
    endpoints.college.edit,
    { org_id, department_id },
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
