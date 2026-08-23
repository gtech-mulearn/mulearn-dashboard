import type { Metadata } from "next";
import { AdminSessionVerificationPage } from "@/features/mentor/sessions/components/admin-session-verification-page";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Session Verification",
  description: "Approve or reject mentor-submitted sessions.",
};

export default async function SessionVerificationRoute() {
  await requireRole(ADMIN_ROLES);
  return <AdminSessionVerificationPage />;
}
