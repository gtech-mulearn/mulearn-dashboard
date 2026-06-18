"use client";

/**
 * Google OAuth2 Callback Page (Client Component)
 *
 * Handles the redirect from Google, exchanges the code for tokens,
 * and redirects the user to the dashboard.
 */

import { useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useGoogleCallback } from "@/features/auth";

export function CallbackPageClient() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || undefined;
  const error = searchParams.get("error") || undefined;

  useGoogleCallback(code, error);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
      <Spinner className="h-8 w-8 text-primary" />
      <div className="text-center">
        <h1 className="text-xl font-semibold">Authenticating...</h1>
        <p className="text-sm">Please wait while we sign you in with Google.</p>
      </div>
    </div>
  );
}
