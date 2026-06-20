/**
 * Onboarding Guard Component
 *
 * 📍 src/app/(dashboard)/onboarding-guard.tsx
 *
 * Client component that checks if user has completed onboarding.
 * Redirects to /onboarding/interests if domains are not set.
 */

"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useUserInfo } from "@/features/auth";
import { authStore, ROLES } from "@/lib/auth";
import Loader from "../loading";

interface OnboardingGuardProps {
  children: ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading, isError, isFetching } = useUserInfo();

  // Session signal: a live access token OR the session flag that outlives it.
  // When absent, there's nothing to refresh against → the user must log in.
  const hasSession = authStore.isAuthenticated();

  const parts = pathname.split("/").filter(Boolean);
  const isPublicProfile =
    parts.length === 3 && parts[0] === "dashboard" && parts[1] === "profile";

  useEffect(() => {
    if (isPublicProfile) return;
    // Still resolving — the query is fetching (which also drives the API
    // client's token refresh + retry). Wait rather than redirecting.
    if (isLoading || isFetching) return;

    // Refresh failed (query errored) or there's no session at all → log out.
    if (isError || !hasSession) {
      router.replace("/login");
      return;
    }

    // Session exists but user not resolved yet (query pending) — wait.
    if (!user) return;

    // Company users have their own onboarding/verification flow —
    // they skip the interests selection step entirely.
    const isCompany = user.roles.includes(ROLES.COMPANY);
    if (isCompany) return;

    // All other roles: redirect to interests onboarding if no domains selected
    if (!user.user_domains || user.user_domains.length === 0) {
      router.replace("/onboarding/interests");
    }
  }, [
    user,
    isLoading,
    isFetching,
    isError,
    hasSession,
    router,
    isPublicProfile,
  ]);

  // Show loading while checking auth state
  if (isLoading) {
    if (isPublicProfile) {
      return <>{children}</>;
    }
    return <Loader />;
  }

  // Show loading while redirecting to login on error
  if (isError || !user) {
    if (isPublicProfile) {
      return <>{children}</>;
    }
    return <Loader />;
  }

  // Company users: always render (they manage onboarding on their own dashboard)
  const isCompany = user.roles.includes(ROLES.COMPANY);
  if (isCompany) {
    return <>{children}</>;
  }

  // Non-company: block render until domains are selected
  if (!user.user_domains || user.user_domains.length === 0) {
    if (isPublicProfile) {
      return <>{children}</>;
    }
    return <Loader />;
  }

  return <>{children}</>;
}
