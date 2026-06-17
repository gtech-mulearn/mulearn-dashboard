import { requireRole } from "@/lib/auth/server";
import { ROLES } from "@/lib/auth/roles";
import { DepartmentsView } from "@/features/organizations";

export const metadata = {
  title: "Organization Departments | Management",
  description: "Manage academic departments linked to organizations.",
};

export default async function OrgDepartmentsPage() {
  await requireRole([ROLES.ADMIN]);
  return <DepartmentsView />;
}
