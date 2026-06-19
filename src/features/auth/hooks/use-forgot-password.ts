/**
 * Forgot Password Hook
 *
 * 📍 src/features/auth/hooks/use-forgot-password.ts
 *
 * TanStack Query mutation for password reset request.
 */

"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import { requestPasswordReset } from "../api";

/**
 * Hook for requesting password reset email
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (emailOrMuid: string) => {
      const response = await requestPasswordReset(emailOrMuid);
      return response;
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to send password reset email",
        }),
      );
    },
  });
}
