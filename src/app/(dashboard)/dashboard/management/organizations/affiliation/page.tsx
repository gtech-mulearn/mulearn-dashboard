import { requireRole } from "@/lib/auth/server";
import { ROLES } from "@/lib/auth/roles";
import { AffiliationView } from "@/features/organizations";

export const metadata = {
  title: "Organization Affiliation | Management",
  description:
    "Manage university and organization affiliations used for college registrations.",
};

export default async function AffiliationPage() {
  await requireRole([ROLES.ADMIN]);
  return <AffiliationView />;
}
