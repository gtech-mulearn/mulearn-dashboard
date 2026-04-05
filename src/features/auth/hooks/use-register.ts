/**
 * Register Hook
 *
 * 📍 src/features/auth/hooks/use-register.ts
 *
 * TanStack Query mutation for user registration.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authStore } from "@/lib/auth";
import { companySignup, fetchUserInfo, registerUser } from "../api";
import type { CompanySignupRequest, RegisterRequest } from "../schemas";
import { authKeys } from "./query-keys";

/**
 * Hook for user registration
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      // 1. Register the user
      const registerResponse = await registerUser(data);

      // 2. Save tokens to cookies BEFORE fetching user info
      const { accessToken, refreshToken } = registerResponse.response;
      authStore.setTokens(accessToken, refreshToken);

      // 3. Fetch user info after tokens are saved
      const userInfoResponse = await fetchUserInfo();

      return {
        tokens: registerResponse.response,
        userInfo: userInfoResponse,
      };
    },
    onSuccess: (data) => {
      // Update the user info cache
      queryClient.setQueryData(authKeys.userInfo(), data.userInfo);
    },
    onError: (error) => {
      console.error("[useRegister] Error occurred:", error);
      console.error("[useRegister] Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        name: error instanceof Error ? error.name : undefined,
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error,
      });
    },
  });
}

/**
 * Hook for company-specific registration.
 *
 * Uses the dedicated POST /api/v1/dashboard/company/create/ endpoint.
 * Tokens are nested inside response.auth (either accessToken/refreshToken
 * or access/refresh depending on backend version — both are handled).
 */
export function useCompanyRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CompanySignupRequest) => {
      // 1. Call the company-specific signup endpoint
      const signupResponse = await companySignup(data);

      // 2. Extract tokens — backend may use camelCase or snake_case keys
      const auth = signupResponse.response.auth;
      const accessToken = auth.accessToken ?? auth.access;
      const refreshToken = auth.refreshToken ?? auth.refresh;

      if (!accessToken || !refreshToken) {
        throw new Error(
          "Company signup succeeded but no auth tokens were returned.",
        );
      }

      // 3. Persist tokens before fetching user info
      authStore.setTokens(accessToken, refreshToken);

      // 4. Fetch user info now that we have a valid session
      const userInfoResponse = await fetchUserInfo();

      return {
        companyId: signupResponse.response.company_id,
        slug: signupResponse.response.slug,
        status: signupResponse.response.status,
        userInfo: userInfoResponse,
      };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.userInfo(), data.userInfo);
    },
    onError: (error) => {
      console.error("[useCompanyRegister] Error occurred:", error);
      console.error("[useCompanyRegister] Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        fullError: error,
      });
    },
  });
}
