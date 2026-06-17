import { requireRole } from "@/lib/auth/server";
import { ROLES } from "@/lib/auth/roles";
import { AdminTasksPageClient } from "./admin-tasks-client";

export const metadata = {
  title: "Intern Tasks | Management",
};

export default async function Page() {
  await requireRole([ROLES.ADMIN, ROLES.ASSOCIATE]);
  return <AdminTasksPageClient />;
}
