/**
 * Onboarding Guard Component
 *
 * 📍 src/app/(dashboard)/onboarding-guard.tsx
 *
 * Client component that checks if user has completed onboarding.
 * Redirects to /onboarding/interests if domains are not set.
 */

"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useUserInfo } from "@/features/auth";
import { ROLES } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";
import Loader from "../loading";

interface OnboardingGuardProps {
  children: ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useUserInfo();
  const { setRole } = useAuthStore();

  useEffect(() => {
    if (user?.roles) {
      const primaryRole = user.roles[0]?.toLowerCase();
      if (primaryRole) setRole(primaryRole);
    }
  }, [user, setRole]);

  useEffect(() => {
    if (isLoading) return;

    // If error fetching user, redirect to login
    if (isError) {
      router.replace("/login");
      return;
    }

    if (!user) return;

    // Company users have their own onboarding/verification flow —
    // they skip the interests selection step entirely.
    const isCompany = user.roles.includes(ROLES.COMPANY);
    if (isCompany) return;

    // All other roles: redirect to interests onboarding if no domains selected
    if (!user.user_domains || user.user_domains.length === 0) {
      router.replace("/onboarding/interests");
    }
  }, [user, isLoading, isError, router]);

  // Show loading while checking auth state
  if (isLoading) {
    return <Loader />;
  }

  // Show loading while redirecting to login on error
  if (isError || !user) {
    return <Loader />;
  }

  // Company users: always render (they manage onboarding on their own dashboard)
  const isCompany = user.roles.includes(ROLES.COMPANY);
  if (isCompany) {
    return <>{children}</>;
  }

  // Non-company: block render until domains are selected
  if (!user.user_domains || user.user_domains.length === 0) {
    return <Loader />;
  }

  return <>{children}</>;
}
