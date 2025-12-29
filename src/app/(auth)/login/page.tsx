/**
 * Login Page
 *
 * 📍 src/app/(auth)/login/page.tsx
 *
 * Server component that renders client login component.
 */

import type { Metadata } from "next";
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
  return <LoginClient redirectUri={params.ruri} />;
}
