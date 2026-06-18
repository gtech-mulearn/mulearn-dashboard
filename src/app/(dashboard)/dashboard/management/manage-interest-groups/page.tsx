import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";
import { ManageInterestGroupsPageClient } from "./manage-interest-groups-client";

export const metadata = {
  title: "Manage Interest Groups | Management",
};

export default async function Page() {
  await requireRole([ROLES.ADMIN]);
  return <ManageInterestGroupsPageClient />;
}
