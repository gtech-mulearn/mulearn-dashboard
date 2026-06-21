/**
 * Session Hook
 *
 * 📍 src/features/auth/hooks/use-session.ts
 *
 * TanStack Query hooks for user session data.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { authStore } from "@/lib/auth";
import {
  fetchCompanyOnboardingStatus,
  fetchPublicUserProfile,
  fetchUserInfo,
} from "../api";
import { authKeys } from "./query-keys";

/**
 * Re-exported from the profile feature so the current user's profile is fetched
 * under a single canonical query key (`profileKeys.profile()`). Previously this
 * feature defined its own `useUserProfile` with a separate query key, which
 * caused a duplicate `user-profile` network request and meant profile mutations
 * never invalidated this copy. See `@/features/profile/hooks/use-profile`.
 */
export { useUserProfile } from "@/features/profile/hooks/use-profile";

/**
 * Hook for fetching current user info (lightweight)
 * Use this for checking auth state and basic user data
 */
export function useUserInfo() {
  const hasToken =
    typeof window !== "undefined" ? authStore.isAuthenticated() : false;
  // Run whenever there's a session signal — a live access token OR the
  // session flag (which outlives the short-lived access token). This lets the
  // request fire even after the access token has expired, so the API client's
  // refresh → retry → logout flow can run, instead of the query staying
  // disabled and leaving guards stuck on a loader forever.
  return useQuery({
    queryKey: authKeys.userInfo(),
    queryFn: fetchUserInfo,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: hasToken,
  });
}

/**
 * Hook for fetching public user profile by muid
 */
export function usePublicUserProfile(muid: string) {
  return useQuery({
    queryKey: authKeys.publicProfile(muid),
    queryFn: () => fetchPublicUserProfile(muid),
    enabled: !!muid,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching the company onboarding/verification status.
 * Only fires when the user has the Company role.
 */
export function useCompanyOnboardingStatus(enabled: boolean) {
  return useQuery({
    queryKey: authKeys.companyOnboardingStatus(),
    queryFn: fetchCompanyOnboardingStatus,
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes — verification can change
    retry: 1,
  });
}
