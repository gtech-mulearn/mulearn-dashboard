import { INTERN_MANAGEMENT_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";
import { ManageMinutesPageClient } from "./manage-minutes-client";

export const metadata = {
  title: "Manage Minutes | Management",
};

export default async function Page() {
  await requireRole(INTERN_MANAGEMENT_ROLES);
  return <ManageMinutesPageClient />;
}
