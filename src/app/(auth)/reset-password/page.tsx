/**
 * Reset Password Page
 *
 * 📍 src/app/(auth)/reset-password/page.tsx
 */

import type { Metadata } from "next";
import { ResetPasswordClient } from "./reset-password-client";

export const metadata: Metadata = {
  title: "Reset Password | μLearn",
  description: "Create a new password for your μLearn account",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  return <ResetPasswordClient token={params.token} />;
}
