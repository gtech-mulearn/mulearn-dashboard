import type { Metadata } from "next";
import { MentorVerificationPage } from "@/features/mentor/admin/components/mentor-verification-page";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Mentor Verification",
  description: "Review and verify mentor applications.",
};

export default async function MentorVerificationRoute() {
  await requireRole(ADMIN_ROLES);
  return <MentorVerificationPage />;
}
