import { DepartmentsView } from "@/features/organizations";
import { FELLOW_MANAGEMENT_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata = {
  title: "Organization Departments | Management",
  description: "Manage academic departments linked to organizations.",
};

export default async function OrgDepartmentsPage() {
  await requireRole(FELLOW_MANAGEMENT_ROLES);
  return <DepartmentsView />;
}
