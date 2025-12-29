/**
 * Session Hook
 *
 * 📍 src/features/auth/hooks/use-session.ts
 *
 * TanStack Query hooks for user session data.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import {
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
  return useQuery({
    queryKey: authKeys.userInfo(),
    queryFn: async () => {
      const response = await fetchUserInfo();
      return response.response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook for fetching full user profile
 * Use this when you need detailed profile data
 */
export function useUserProfile() {
  return useQuery({
    queryKey: authKeys.userProfile(),
    queryFn: async () => {
      const response = await fetchUserProfile();
      return response.response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching public user profile by muid
 */
export function usePublicUserProfile(muid: string) {
  return useQuery({
    queryKey: authKeys.publicProfile(muid),
    queryFn: async () => {
      const response = await fetchPublicUserProfile(muid);
      return response.response;
    },
    enabled: !!muid,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
