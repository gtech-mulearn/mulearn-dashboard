import { VerifyOrgsView } from "@/features/organizations";
import { FELLOW_MANAGEMENT_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata = {
  title: "Organization Verification | Management",
  description:
    "Review and approve or reject unverified organization submissions.",
};

export default async function VerifyOrgsPage() {
  await requireRole(FELLOW_MANAGEMENT_ROLES);
  return <VerifyOrgsView />;
}
