import { FELLOW_MANAGEMENT_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";
import { ManageInterestGroupsPageClient } from "./manage-interest-groups-client";

export const metadata = {
  title: "Manage Interest Groups | Management",
};

export default async function Page() {
  await requireRole(FELLOW_MANAGEMENT_ROLES);
  return <ManageInterestGroupsPageClient />;
}
