import { requireRole } from "@/lib/auth/server";
import { ROLES } from "@/lib/auth/roles";
import { OrganizationsView } from "@/features/organizations";

export const metadata = {
  title: "Organizations | Management",
  description:
    "Create and manage organization profiles including colleges, companies, communities, and schools.",
};

export default async function OrganizationsPage() {
  await requireRole([ROLES.ADMIN]);
  return <OrganizationsView />;
}
