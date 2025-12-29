/**
 * Forgot Password Page
 *
 * 📍 src/app/(auth)/forgot-password/page.tsx
 */

import type { Metadata } from "next";
import { ForgotPasswordClient } from "./forgot-password-client";

export const metadata: Metadata = {
  title: "Forgot Password | μLearn",
  description: "Reset your μLearn account password",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
