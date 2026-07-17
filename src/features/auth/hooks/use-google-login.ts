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
import { authStore } from "@/lib/auth";
import { useGoogleTempTokenStore } from "@/stores/oauth-store";
import { fetchGoogleAuthUrl, fetchGoogleCallback, fetchUserInfo } from "../api";
import { authKeys } from "./query-keys";

/**
 * Hook to initiate Google OAuth2 flow.
 * Fetches the redirect URL and navigates the browser to it.
 */
export function useGoogleAuthUrl() {
  return useMutation({
    mutationFn: async () => {
      const { redirect_url } = await fetchGoogleAuthUrl();
      if (typeof window !== "undefined") {
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
export function useGoogleCallback(code?: string, error?: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const hasRun = useRef(false);

  const mutation = useMutation({
    mutationFn: async ({ code: authCode }: { code: string }) => {
      const tokenData = await fetchGoogleCallback(authCode);

      if (tokenData.isNewUser === true && tokenData.tempToken) {
        useGoogleTempTokenStore.getState().setTempToken(tokenData.tempToken);

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
      mutation.mutate({ code });
    }
  }, [code, error, router, mutation.mutate]);

  return mutation;
}
