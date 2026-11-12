import { INTERN_MANAGEMENT_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";
import { AdminTasksPageClient } from "./admin-tasks-client";

export const metadata = {
  title: "Intern Tasks | Management",
};

export default async function Page() {
  await requireRole(INTERN_MANAGEMENT_ROLES);
  return <AdminTasksPageClient />;
}
