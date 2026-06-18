import { OrganizationsView } from "@/features/organizations";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata = {
  title: "Organizations | Management",
  description:
    "Create and manage organization profiles including colleges, companies, communities, and schools.",
};

export default async function OrganizationsPage() {
  await requireRole([ROLES.ADMIN]);
  return <OrganizationsView />;
}
