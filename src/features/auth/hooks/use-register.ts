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
import { fetchUserInfo, registerUser } from "../api";
import type { RegisterRequest } from "../schemas";
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
  });
}
