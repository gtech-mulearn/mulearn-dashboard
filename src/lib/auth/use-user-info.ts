/**
 * useUserInfo: the signed-in user's info, read by the guards, the permissions hook, the topbar and
 * the pages.
 *
 * 📍 src/lib/auth/use-user-info.ts
 *
 * Moved here from the auth feature's use-session.ts for dashboard issue 0011 (see user-info.ts).
 * Not re-exported from `@/lib/auth`, like server.ts, because it's a client hook. Import it
 * directly: `import { useUserInfo } from "@/lib/auth/use-user-info"`.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { authStore } from "./token-store";
import { fetchUserInfo, userInfoKey } from "./user-info";

/**
 * Hook for fetching current user info (lightweight)
 * Use this for checking auth state and basic user data
 */
export function useUserInfo() {
  const hasToken =
    typeof window !== "undefined" ? authStore.isAuthenticated() : false;
  // Run whenever there's a session signal — a live access token OR the
  // session flag (which outlives the short-lived access token). This lets the
  // request fire even after the access token has expired, so the API client's
  // refresh → retry → logout flow can run, instead of the query staying
  // disabled and leaving guards stuck on a loader forever.
  return useQuery({
    queryKey: userInfoKey(),
    queryFn: fetchUserInfo,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: hasToken,
  });
}
