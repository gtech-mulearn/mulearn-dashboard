/**
 * Register Page
 *
 * 📍 src/app/(auth)/register/page.tsx
 */

import type { Metadata } from "next";
import { RegisterClient } from "./register-client";

export const metadata: Metadata = {
  title: "Create Account | μLearn",
  description: "Create your μLearn account and start learning",
};

interface RegisterPageProps {
  searchParams: Promise<{
    ruri?: string;
    referral_id?: string;
  }>;
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams;
  return (
    <RegisterClient redirectUri={params.ruri} referralId={params.referral_id} />
  );
}
