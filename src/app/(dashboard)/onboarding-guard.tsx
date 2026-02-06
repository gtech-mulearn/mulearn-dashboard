/**
 * Onboarding Guard Component
 *
 * 📍 src/app/(dashboard)/onboarding-guard.tsx
 *
 * Client component that checks if user has completed onboarding.
 * Redirects to /onboarding/interests if domains are not set.
 */

"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useUserInfo } from "@/features/auth";

interface OnboardingGuardProps {
  children: ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useUserInfo();

  useEffect(() => {
    if (isLoading) return;

    // If error fetching user, redirect to login
    if (isError) {
      router.replace("/login");
      return;
    }

    // If user has no domains selected, redirect to onboarding
    if (user && (!user.user_domains || user.user_domains.length === 0)) {
      router.replace("/onboarding/interests");
      return;
    }
  }, [user, isLoading, isError, router]);

  // Show loading while checking
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show loading while redirecting
  if (
    isError ||
    !user ||
    !user.user_domains ||
    user.user_domains.length === 0
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // User has completed onboarding, render children
  return <>{children}</>;
}
