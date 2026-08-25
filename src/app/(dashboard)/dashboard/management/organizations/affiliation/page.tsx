import { AffiliationView } from "@/features/organizations";
import { MANAGEMENT_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata = {
  title: "Organization Affiliation | Management",
  description:
    "Manage university and organization affiliations used for college registrations.",
};

export default async function AffiliationPage() {
  await requireRole(MANAGEMENT_ROLES);
  return <AffiliationView />;
}
