/**
 * Profile Hooks
 *
 * 📍 src/features/profile/hooks/use-profile.ts
 *
 * TanStack Query hooks for profile data with caching.
 * Profile data rarely changes, so we use a longer stale time.
 */

import { useQuery } from "@tanstack/react-query";
import {
  getCommunities,
  getConnectedDIDs,
  getCountries,
  getDistricts,
  getEditableUserProfile,
  getInterestGroupsList,
  getOrganizationsAndDepartments,
  getPublicUserLevels,
  getPublicUserLog,
  getPublicUserProfile,
  getSocials,
  getStates,
  getUserAchievements,
  getUserLevels,
  getUserLog,
  getUserPreferences,
  getUserProfile,
} from "../api";
import { profileKeys } from "./query-keys";

// Cache for 5 minutes since profile data rarely changes
const PROFILE_STALE_TIME = 5 * 60 * 1000;

// ============================================
// User Profile Hooks
// ============================================

/**
 * Fetch current user's full profile.
 * Data is cached and deduplicated across components.
 */
export function useUserProfile() {
  return useQuery({
    queryKey: profileKeys.profile(),
    queryFn: getUserProfile,
    staleTime: PROFILE_STALE_TIME,
  });
}

/** Fetch editable profile payload used by edit modal prefill */
export function useEditableProfile(enabled = true) {
  return useQuery({
    queryKey: profileKeys.editableProfile(),
    queryFn: getEditableUserProfile,
    staleTime: 0,
    enabled,
    refetchOnMount: "always",
  });
}

/**
 * Fetch public user profile by muid.
 * Each muid has its own cache entry.
 */
export function usePublicProfile(muid: string) {
  return useQuery({
    queryKey: profileKeys.publicProfile(muid),
    queryFn: () => getPublicUserProfile(muid),
    staleTime: PROFILE_STALE_TIME,
    enabled: !!muid,
  });
}

// ============================================
// Activity Log Hooks
// ============================================

/** Fetch current user's activity log */
export function useUserLog() {
  return useQuery({
    queryKey: profileKeys.log(),
    queryFn: getUserLog,
    staleTime: PROFILE_STALE_TIME,
  });
}

/** Fetch public user's activity log */
export function usePublicUserLog(muid: string) {
  return useQuery({
    queryKey: profileKeys.publicLog(muid),
    queryFn: () => getPublicUserLog(muid),
    staleTime: PROFILE_STALE_TIME,
    enabled: !!muid,
  });
}

// ============================================
// User Levels Hooks
// ============================================

/** Fetch current user's level progress */
export function useUserLevels() {
  return useQuery({
    queryKey: profileKeys.levels(),
    queryFn: getUserLevels,
    staleTime: PROFILE_STALE_TIME,
  });
}

/** Fetch public user's level progress */
export function usePublicUserLevels(muid: string) {
  return useQuery({
    queryKey: profileKeys.publicLevels(muid),
    queryFn: () => getPublicUserLevels(muid),
    staleTime: PROFILE_STALE_TIME,
    enabled: !!muid,
  });
}

// ============================================
// Socials Hook
// ============================================

/** Fetch user's social links */
export function useSocials() {
  return useQuery({
    queryKey: profileKeys.socials(),
    queryFn: getSocials,
    staleTime: PROFILE_STALE_TIME,
  });
}

// ============================================
// Preferences Hook
// ============================================

/** Fetch user preferences */
export function useUserPreferences() {
  return useQuery({
    queryKey: profileKeys.preferences(),
    queryFn: getUserPreferences,
    staleTime: PROFILE_STALE_TIME,
  });
}

// ============================================
// Interest Groups Hook
// ============================================

/** Fetch list of all interest groups */
export function useInterestGroupsList() {
  return useQuery({
    queryKey: profileKeys.interestGroups(),
    queryFn: getInterestGroupsList,
    staleTime: 10 * 60 * 1000, // 10 minutes - rarely changes
  });
}

/** Fetch available communities */
export function useCommunities() {
  return useQuery({
    queryKey: profileKeys.communities(),
    queryFn: getCommunities,
    staleTime: 10 * 60 * 1000,
  });
}

/** Fetch available countries */
export function useCountries() {
  return useQuery({
    queryKey: profileKeys.countries(),
    queryFn: getCountries,
    staleTime: 10 * 60 * 1000,
  });
}

/** Fetch states for selected country */
export function useStates(countryId: string) {
  return useQuery({
    queryKey: profileKeys.states(countryId),
    queryFn: () => getStates(countryId),
    enabled: Boolean(countryId),
    staleTime: 10 * 60 * 1000,
  });
}

/** Fetch districts for selected state */
export function useDistricts(stateId: string) {
  return useQuery({
    queryKey: profileKeys.districts(stateId),
    queryFn: () => getDistricts(stateId),
    enabled: Boolean(stateId),
    staleTime: 10 * 60 * 1000,
  });
}

/** Fetch organizations and departments for selected district */
export function useOrganizationData(districtId: string) {
  return useQuery({
    queryKey: profileKeys.organizationData(districtId),
    queryFn: () => getOrganizationsAndDepartments(districtId),
    enabled: Boolean(districtId),
    staleTime: 10 * 60 * 1000,
  });
}

// ============================================
// Achievements Hooks
// ============================================

/** Fetch user achievements by muid */
export function useUserAchievements(muid: string) {
  return useQuery({
    queryKey: profileKeys.achievements(muid),
    queryFn: () => getUserAchievements(muid),
    enabled: !!muid,
    staleTime: PROFILE_STALE_TIME,
  });
}

/** Fetch connected DIDs for user */
export function useConnectedDIDs(muid: string) {
  return useQuery({
    queryKey: profileKeys.connectedDIDs(muid),
    queryFn: () => getConnectedDIDs(muid),
    enabled: !!muid,
    staleTime: PROFILE_STALE_TIME,
  });
}
