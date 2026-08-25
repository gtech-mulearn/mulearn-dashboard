/**
 * Google Login Hooks
 *
 * 📍 src/features/auth/hooks/use-google-login.ts
 *
 * TanStack Query mutations for Google OAuth2 flow.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import { authStore, consumeState, rememberState } from "@/lib/auth";
import { fetchGoogleAuthUrl, fetchGoogleCallback, fetchUserInfo } from "../api";
import { authKeys } from "./query-keys";

/**
 * Hook to initiate Google OAuth2 flow.
 * Fetches the redirect URL and navigates the browser to it.
 */
export function useGoogleAuthUrl() {
  return useMutation({
    mutationFn: async () => {
      const { redirect_url, state } = await fetchGoogleAuthUrl();
      if (typeof window !== "undefined") {
        // F5: remember before navigating. If this throws we must NOT send the
        // user to Google — an unverifiable callback is worse than no login.
        rememberState(state);
        window.location.href = redirect_url;
      }
      return redirect_url;
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to initiate Google login",
        }),
      );
    },
  });
}

/**
 * Hook to handle Google OAuth2 callback.
 * Exchanges the auth code for tokens and fetches user info.
 */
export function useGoogleCallback(
  code?: string,
  state?: string,
  error?: string,
) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const hasRun = useRef(false);

  const mutation = useMutation({
    mutationFn: async ({
      code: authCode,
      state: returnedState,
    }: {
      code: string;
      state?: string;
    }) => {
      // F5: bind this callback to the browser that started the flow, BEFORE
      // the code is spent. consumeState throws OAuthStateError on mismatch,
      // which the mutation's onError turns into a toast + redirect to /login.
      consumeState(returnedState);

      const tokenData = await fetchGoogleCallback(
        authCode,
        returnedState as string,
      );

      if (tokenData.isNewUser === true && tokenData.tempToken) {
        await authStore.setTempToken(tokenData.tempToken);

        const params = new URLSearchParams();
        if (tokenData.email) params.set("email", tokenData.email);
        if (tokenData.fullName) params.set("fullName", tokenData.fullName);
        router.replace(`/register?${params.toString()}`);
        return { isNewUser: true };
      }

      if (tokenData.accessToken && tokenData.refreshToken) {
        await authStore.setTokens(
          tokenData.accessToken,
          tokenData.refreshToken,
        );
      } else {
        throw new Error("Missing tokens in response");
      }

      const userInfo = await fetchUserInfo();

      queryClient.clear();
      queryClient.setQueryData(authKeys.userInfo(), userInfo);

      return { tokens: tokenData, userInfo, isNewUser: false };
    },
    onSuccess: (data) => {
      if (!data?.isNewUser) {
        toast.success("Welcome back!");
        router.push("/dashboard");
      }
    },
    onError: (err) => {
      toast.error(
        getApiResponseError(err, {
          fallback: "Something went wrong. Please try again.",
        }),
      );
      router.push("/login");
    },
  });

  useEffect(() => {
    if (hasRun.current) return;

    if (error) {
      hasRun.current = true;
      toast.error(
        getApiResponseError(error, { fallback: "Google login failed" }),
      );
      router.push("/login");
      return;
    }

    if (code) {
      hasRun.current = true;
      mutation.mutate({ code, state });
    }
  }, [code, state, error, router, mutation.mutate]);

  return mutation;
}
