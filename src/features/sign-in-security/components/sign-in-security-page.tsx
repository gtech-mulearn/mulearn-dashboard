/**
 * Sign-in security: lockout policy, signing a member out, recent sign-ins and
 * the identity provider's settings.
 *
 * 📍 src/features/sign-in-security/components/sign-in-security-page.tsx
 */

"use client";

import { AppWindow, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LoginAttemptsPanel } from "./login-attempts-panel";
import { PolicyPanel } from "./policy-panel";
import { PosturePanel } from "./posture-panel";
import { RevokeSessionsPanel } from "./revoke-sessions-panel";

export function SignInSecurityPage() {
  return (
    <div className="space-y-6 py-6">
      <Link
        href="/dashboard/management/system"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to System & Configurations
      </Link>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Sign-in security
          </h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            How "Sign in with µLearn" protects accounts. Every change here is
            recorded in the audit log.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/management/system/applications">
            <AppWindow className="mr-2 h-4 w-4" />
            Connected apps
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PolicyPanel />
        <RevokeSessionsPanel />
      </div>
      <LoginAttemptsPanel />
      <PosturePanel />
    </div>
  );
}
