import type { Metadata } from "next";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";
import { RoleVerificationClient } from "./role-verification-client";

export const metadata: Metadata = {
  title: "Role Verification",
  description: "Review mentor, enabler, organization and company requests.",
};

export default async function RoleVerificationPage() {
  await requireRole(ADMIN_ROLES);
  return <RoleVerificationClient />;
}
