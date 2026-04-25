/**
 * Google Login Hooks
 *
 * 📍 src/features/auth/hooks/use-google-login.ts
 *
 * TanStack Query mutations for Google OAuth2 flow.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authStore } from "@/lib/auth";
import { fetchUserInfo, getGoogleAuthUrl, handleGoogleCallback } from "../api";
import { authKeys } from "./query-keys";

/**
 * Hook to initiate Google OAuth2 flow.
 * Fetches the redirect URL and navigates the browser to it.
 */
export function useGoogleAuthUrl() {
  return useMutation({
    mutationFn: async () => {
      const { redirect_url } = await getGoogleAuthUrl();
      if (typeof window !== "undefined") {
        window.location.href = redirect_url;
      }
      return redirect_url;
    },
  });
}

/**
 * Hook to handle Google OAuth2 callback.
 * Exchanges the auth code for tokens and fetches user info.
 */
export function useGoogleCallback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      // 1. Exchange code for tokens
      const tokenData = await handleGoogleCallback(code);

      // 2. Save tokens to store
      authStore.setTokens(tokenData.accessToken, tokenData.refreshToken);

      // 3. Fetch user info
      const userInfo = await fetchUserInfo();

      return {
        tokens: tokenData,
        userInfo,
      };
    },
    onSuccess: (data) => {
      // Clear stale queries
      queryClient.clear();
      queryClient.setQueryData(authKeys.userInfo(), data.userInfo);
    },
  });
}
