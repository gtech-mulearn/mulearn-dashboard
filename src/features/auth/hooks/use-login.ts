/**
 * Login Hook
 *
 * 📍 src/features/auth/hooks/use-login.ts
 *
 * TanStack Query mutation for login.
 * Handles both password and OTP login flows.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserInfo, loginWithOTP, loginWithPassword } from "../api";
import { authKeys } from "./query-keys";
import { authStore } from "@/lib/auth";

interface LoginWithPasswordParams {
  emailOrMuid: string;
  password: string;
}

interface LoginWithOTPParams {
  emailOrMuid: string;
  otp: string;
}

/**
 * Hook for password-based login
 */
export function useLoginWithPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ emailOrMuid, password }: LoginWithPasswordParams) => {
      // 1. Login and get tokens (API returns data directly, not wrapped)
      const tokenData = await loginWithPassword(emailOrMuid, password);

      // 2. Save tokens to store (cookies)
      authStore.setTokens(tokenData.accessToken, tokenData.refreshToken);

      // 3. Fetch user info immediately after login
      const userInfo = await fetchUserInfo();

      return {
        tokens: tokenData,
        userInfo,
      };
    },
    onSuccess: (data) => {
      // Clear any stale queries and set fresh user info
      queryClient.clear();
      queryClient.setQueryData(authKeys.userInfo(), data.userInfo);
    },
  });
}

/**
 * Hook for OTP-based login
 */
export function useLoginWithOTP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ emailOrMuid, otp }: LoginWithOTPParams) => {
      // 1. Login with OTP (API returns data directly)
      const tokenData = await loginWithOTP(emailOrMuid, otp);

      // 2. Save tokens
      authStore.setTokens(tokenData.accessToken, tokenData.refreshToken);

      // 3. Fetch user info immediately after login
      const userInfo = await fetchUserInfo();

      return {
        tokens: tokenData,
        userInfo,
      };
    },
    onSuccess: (data) => {
      // Clear any stale queries and set fresh user info
      queryClient.clear();
      queryClient.setQueryData(authKeys.userInfo(), data.userInfo);
    },
  });
}
