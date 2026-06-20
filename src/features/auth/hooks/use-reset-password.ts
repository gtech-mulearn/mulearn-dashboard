/**
 * Reset Password Hook
 *
 * 📍 src/features/auth/hooks/use-reset-password.ts
 *
 * TanStack Query hooks for password reset flow.
 */

"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import { resetPassword, verifyResetToken } from "../api";
import { authKeys } from "./query-keys";

/**
 * Hook for verifying reset token is valid
 * Use this when the reset password page loads
 */
export function useVerifyResetToken(token: string) {
  return useQuery({
    queryKey: authKeys.resetToken(token),
    queryFn: () => verifyResetToken(token),
    enabled: !!token,
    retry: false, // Don't retry on invalid tokens
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

interface ResetPasswordParams {
  token: string;
  password: string;
}

/**
 * Hook for resetting password with token
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ token, password }: ResetPasswordParams) => {
      const response = await resetPassword(token, password);
      return response;
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to reset password" }),
      );
    },
  });
}
