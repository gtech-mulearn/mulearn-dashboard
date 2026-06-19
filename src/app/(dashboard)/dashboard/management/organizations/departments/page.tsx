import { DepartmentsView } from "@/features/organizations";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata = {
  title: "Organization Departments | Management",
  description: "Manage academic departments linked to organizations.",
};

export default async function OrgDepartmentsPage() {
  await requireRole([ROLES.ADMIN]);
  return <DepartmentsView />;
}
