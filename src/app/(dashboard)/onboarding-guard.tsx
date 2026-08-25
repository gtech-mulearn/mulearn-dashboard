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
import { authStore, isPublicDashboardRoute, ROLES } from "@/lib/auth";
import Loader from "../loading";

interface OnboardingGuardProps {
  children: ReactNode;
}

/**
 * Does this person still have onboarding to do?
 *
 * Prefers the server's answer. The old rule — "no domains means not
 * onboarded" — lived only in this component, so nothing else in the estate
 * applied it. Now that other apps can sign people in, and express signups have
 * no domains by definition, the decision belongs on the server where every
 * consumer sees the same result.
 *
 * The fallback keeps this working against a backend that has not shipped the
 * field yet, so the two can deploy in either order.
 */
function needsOnboarding(user: {
  roles: string[];
  user_domains?: string[];
  onboarding?: { state: string; exempt: boolean };
}): boolean {
  if (user.onboarding) {
    return user.onboarding.state === "INCOMPLETE";
  }
  // Legacy fallback, including the company exemption this component has always
  // applied. Delete once the backend field is deployed everywhere.
  if (user.roles.includes(ROLES.COMPANY)) return false;
  return !user.user_domains || user.user_domains.length === 0;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading, isError, isFetching } = useUserInfo();

  // Session signal: a live access token OR the session flag that outlives it.
  // When absent, there's nothing to refresh against → the user must log in.
  const hasSession = authStore.isAuthenticated();

  const isPublicRoute = isPublicDashboardRoute(pathname);

  useEffect(() => {
    if (isPublicRoute) return;
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
    if (needsOnboarding(user)) {
      router.replace("/onboarding/interests");
    }
  }, [user, isLoading, isFetching, isError, hasSession, router, isPublicRoute]);

  // Show loading while checking auth state
  if (isLoading) {
    if (isPublicRoute) {
      return <>{children}</>;
    }
    return <Loader />;
  }

  // Show loading while redirecting to login on error
  if (isError || !user) {
    if (isPublicRoute) {
      return <>{children}</>;
    }
    return <Loader />;
  }

  // Company users: always render (they manage onboarding on their own dashboard)
  const isCompany = user.roles.includes(ROLES.COMPANY);
  if (isCompany) {
    return <>{children}</>;
  }

  // Block render until onboarding is done, so a half-onboarded dashboard is
  // never briefly visible before the redirect lands.
  if (needsOnboarding(user)) {
    if (isPublicRoute) {
      return <>{children}</>;
    }
    return <Loader />;
  }

  return <>{children}</>;
}
