import { requireRole } from "@/lib/auth/server";
import { ROLES } from "@/lib/auth/roles";
import { VerifyOrgsView } from "@/features/organizations";

export const metadata = {
  title: "Organization Verification | Management",
  description:
    "Review and approve or reject unverified organization submissions.",
};

export default async function VerifyOrgsPage() {
  await requireRole([ROLES.ADMIN]);
  return <VerifyOrgsView />;
}
