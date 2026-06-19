import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";
import { ManageInternsPageClient } from "./manage-interns-client";

export const metadata = {
  title: "Manage Interns | Management",
};

export default async function Page() {
  await requireRole([ROLES.ADMIN, ROLES.ASSOCIATE]);
  return <ManageInternsPageClient />;
}
