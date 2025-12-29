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
      // 1. Login and get tokens
      const loginResponse = await loginWithPassword(emailOrMuid, password);

      // 2. Save tokens to store (cookies)
      const { accessToken, refreshToken } = loginResponse.response;
      authStore.setTokens(accessToken, refreshToken);

      // 3. Fetch user info immediately after login
      // Now the client will automatically include the token
      const userInfoResponse = await fetchUserInfo();

      return {
        tokens: loginResponse.response,
        userInfo: userInfoResponse.response,
      };
    },
    onSuccess: (data) => {
      // Update the user info cache
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
      // 1. Login with OTP
      const loginResponse = await loginWithOTP(emailOrMuid, otp);

      // 2. Save tokens
      const { accessToken, refreshToken } = loginResponse.response;
      authStore.setTokens(accessToken, refreshToken);

      // 3. Fetch user info immediately after login
      const userInfoResponse = await fetchUserInfo();

      return {
        tokens: loginResponse.response,
        userInfo: userInfoResponse.response,
      };
    },
    onSuccess: (data) => {
      // Update the user info cache
      queryClient.setQueryData(authKeys.userInfo(), data.userInfo);
    },
  });
}
