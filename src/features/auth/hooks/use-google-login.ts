/**
 * Google Login Hooks
 *
 * 📍 src/features/auth/hooks/use-google-login.ts
 *
 * TanStack Query mutations for Google OAuth2 flow.
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authStore } from "@/lib/auth";
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
  });
}

/**
 * Hook to handle Google OAuth2 callback.
 * Exchanges the auth code for tokens and fetches user info.
 */
export function useGoogleCallback(code?: string, error?: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: authKeys.googleCallback(code),
    queryFn: async () => {
      if (error) {
        toast.error(error || "Google login failed");
        router.push("/login");
        return null;
      }

      if (!code) {
        toast.error("No authorization code received");
        router.push("/login");
        return null;
      }

      try {
        const tokenData = await fetchGoogleCallback(code);
        authStore.setTokens(tokenData.accessToken, tokenData.refreshToken);
        const userInfo = await fetchUserInfo();

        queryClient.clear();
        queryClient.setQueryData(authKeys.userInfo(), userInfo);

        toast.success("Welcome back!");
        router.push("/dashboard");

        return {
          tokens: tokenData,
          userInfo,
        };
      } catch (err) {
        console.error("Google callback error:", err);
        toast.error("Failed to authenticate with Google");
        router.push("/login");
        throw err;
      }
    },
    enabled: !!code || !!error,
  });
}
