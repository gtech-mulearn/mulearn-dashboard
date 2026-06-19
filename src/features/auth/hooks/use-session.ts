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
  fetchUserProfile,
} from "../api";
import { authKeys } from "./query-keys";

/**
 * Hook for fetching current user info (lightweight)
 * Use this for checking auth state and basic user data
 */
export function useUserInfo() {
  const hasToken =
    typeof window !== "undefined" ? authStore.isAuthenticated() : false;
  return useQuery({
    queryKey: authKeys.userInfo(),
    queryFn: fetchUserInfo,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: hasToken,
  });
}

/**
 * Hook for fetching full user profile
 * Use this when you need detailed profile data
 *
 * @param options.enabled - When false, the query is skipped entirely (no network request).
 *   Defaults to true. Pass `{ enabled: false }` to conditionally disable for users
 *   where profile data is not needed (e.g. non-Enabler users on the home dashboard).
 */
export function useUserProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: authKeys.userProfile(),
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
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
