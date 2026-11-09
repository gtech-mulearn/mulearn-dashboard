"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileKeys } from "@/features/profile/hooks/query-keys";
import {
  confirmEmailChange,
  confirmEmailVerification,
  getEmailVerificationStatus,
  requestEmailChange,
  requestEmailVerification,
  sendSignupCode,
  verifySignupCode,
} from "../api";
import { emailVerificationKeys } from "./query-keys";

// Errors render inside the forms (spec A §4), so these hooks never toast.

export function useEmailVerificationStatus(enabled = true) {
  return useQuery({
    queryKey: emailVerificationKeys.status(),
    queryFn: getEmailVerificationStatus,
    enabled,
    staleTime: 60_000,
  });
}

export function useSendSignupCode() {
  return useMutation({ mutationFn: (email: string) => sendSignupCode(email) });
}

export function useVerifySignupCode() {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      verifySignupCode(email, code),
  });
}

export function useRequestEmailVerification() {
  return useMutation({ mutationFn: () => requestEmailVerification() });
}

export function useConfirmEmailVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => confirmEmailVerification(code),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: emailVerificationKeys.all }),
  });
}

export function useRequestEmailChange() {
  return useMutation({
    mutationFn: ({
      newEmail,
      currentPassword,
    }: {
      newEmail: string;
      currentPassword?: string;
    }) => requestEmailChange(newEmail, currentPassword),
  });
}

export function useConfirmEmailChange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => confirmEmailChange(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailVerificationKeys.all });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}
