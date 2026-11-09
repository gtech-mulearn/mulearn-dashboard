/**
 * Sign-in security queries and mutations.
 *
 * 📍 src/features/sign-in-security/hooks/use-sign-in-security.ts
 */

"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  getLoginAttempts,
  getSecurityPosture,
  getSigninPolicy,
  revokeMemberSessions,
  updateSigninPolicy,
} from "../api";
import type { LoginAttemptFilters, SigninPolicy } from "../schemas";

export const signInSecurityKeys = {
  all: ["sign-in-security"] as const,
  policy: () => [...signInSecurityKeys.all, "policy"] as const,
  posture: () => [...signInSecurityKeys.all, "posture"] as const,
  attempts: (filters: LoginAttemptFilters) =>
    [...signInSecurityKeys.all, "attempts", filters] as const,
};

export function useSigninPolicy() {
  return useQuery({
    queryKey: signInSecurityKeys.policy(),
    queryFn: getSigninPolicy,
  });
}

export function useSecurityPosture() {
  return useQuery({
    queryKey: signInSecurityKeys.posture(),
    queryFn: getSecurityPosture,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLoginAttempts(filters: LoginAttemptFilters) {
  return useInfiniteQuery({
    queryKey: signInSecurityKeys.attempts(filters),
    queryFn: ({ pageParam }) => getLoginAttempts(filters, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.next_before ?? undefined,
  });
}

export function useUpdateSigninPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (policy: SigninPolicy) => updateSigninPolicy(policy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: signInSecurityKeys.policy() });
      queryClient.invalidateQueries({ queryKey: signInSecurityKeys.posture() });
      toast.success("Sign-in policy updated.");
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, { fallback: "Couldn't update the policy." }),
      ),
  });
}

export function useRevokeMemberSessions() {
  return useMutation({
    mutationFn: ({ muid, reason }: { muid: string; reason?: string }) =>
      revokeMemberSessions(muid, reason),
    onSuccess: (message) => toast.success(message),
    onError: (error) =>
      toast.error(
        getApiResponseError(error, {
          fallback: "Couldn't sign the member out.",
        }),
      ),
  });
}
