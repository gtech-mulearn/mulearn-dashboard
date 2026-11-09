/**
 * Sign-in security for "Sign in with µLearn".
 *
 * Route: /dashboard/management/system/sign-in
 * RBAC: Admins. The backend also checks for a verified Admins role link.
 */

import type { Metadata } from "next";
import { SignInSecurityPage } from "@/features/sign-in-security";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Sign-in security | System & Configurations",
  description: "Lockout policy, recent sign-ins and sign-in settings.",
};

export default async function SignInSecurityRoute() {
  await requireRole(ADMIN_ROLES);
  return <SignInSecurityPage />;
}
