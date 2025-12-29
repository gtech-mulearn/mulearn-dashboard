/**
 * Request OTP Hook
 *
 * 📍 src/features/auth/hooks/use-request-otp.ts
 *
 * TanStack Query mutation for requesting login OTP.
 */

"use client";

import { useMutation } from "@tanstack/react-query";
import { requestLoginOTP } from "../api";

/**
 * Hook for requesting OTP for login
 */
export function useRequestOTP() {
  return useMutation({
    mutationFn: async (emailOrMuid: string) => {
      const response = await requestLoginOTP(emailOrMuid);
      return response;
    },
  });
}
