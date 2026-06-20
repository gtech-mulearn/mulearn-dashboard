/**
 * Register Hook
 *
 * 📍 src/features/auth/hooks/use-register.ts
 *
 * TanStack Query mutation for user registration.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import { authStore } from "@/lib/auth";
import {
  companySignup,
  fetchUserInfo,
  registerUser,
  updateCompanyRegistration,
} from "../api";
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
      await authStore.setTokens(accessToken, refreshToken);

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
      toast.error(
        getApiResponseError(error, { fallback: "Registration failed" }),
      );
    },
  });
}

/**
 * Hook for company-specific registration.
 *
 * Uses the dedicated POST /api/v1/dashboard/company/register/ endpoint.
 * Tokens might be nested inside response.auth
 */
export function useCompanyRegister() {
  return useMutation({
    mutationFn: async (data: CompanySignupRequest) => {
      const response = await companySignup(data);
      return response.response;
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Company registration failed",
        }),
      );
    },
  });
}

/**
 * Hook for updating a pending or rejected company registration.
 *
 * Uses the dedicated PATCH /api/v1/dashboard/company/register/ endpoint.
 */
export function useUpdateCompanyRegister() {
  return useMutation({
    mutationFn: async (data: Partial<CompanySignupRequest>) => {
      const response = await updateCompanyRegistration(data);
      return response.response;
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update company registration",
        }),
      );
    },
  });
}
