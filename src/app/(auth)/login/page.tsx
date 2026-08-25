/**
 * Login Page
 *
 * 📍 src/app/(auth)/login/page.tsx
 *
 * Server component. Either hands off to "Sign in with μLearn" or renders the
 * existing login form, depending on OIDC_ENABLED.
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginClient } from "./login-client";

export const metadata: Metadata = {
  title: "Sign In | μLearn",
  description: "Sign in to your μLearn account",
};

interface LoginPageProps {
  searchParams: Promise<{ ruri?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  /**
   * When the identity provider is live, the dashboard stops collecting
   * passwords itself and becomes a client like any other app: sign-in happens
   * on auth.mulearn.org and comes back as an authorization code.
   *
   * Behind a flag deliberately, and read server-side so it is not shipped to
   * the browser:
   *
   *   - it can be enabled per environment, dev before production;
   *   - if anything is wrong it is switched off without a deploy, and the
   *     existing form is still right there;
   *   - EXISTING SESSIONS ARE UNAFFECTED either way. This only changes where a
   *     NEW sign-in happens. Nobody is logged out by flipping it, which is what
   *     lets people migrate by attrition instead of by force.
   *
   * The old form stays until the metrics show no legacy tokens are being
   * validated. Deleting it earlier would remove the way back.
   */
  if (process.env.OIDC_ENABLED === "true") {
    const query = params.ruri
      ? `?${new URLSearchParams({ ruri: params.ruri })}`
      : "";
    redirect(`/api/auth/oidc/start${query}`);
  }

  return <LoginClient redirectUri={params.ruri} />;
}
