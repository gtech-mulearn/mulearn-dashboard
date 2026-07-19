import { redirect } from "next/navigation";
import { ROLES } from "@/lib/auth/roles";
import { requireAuth } from "@/lib/auth/server";
import { ManageInterestGroupsPageClient } from "../management/manage-interest-groups/manage-interest-groups-client";

export const metadata = {
  title: "Manage Interest Groups | Management",
};

export default async function Page() {
  const user = await requireAuth();

  const isAdmin = user.roles.includes(ROLES.ADMIN);
  const isIgLead =
    user.roles.includes(ROLES.IG_LEAD) ||
    user.roles.some((r) => r.endsWith(" IGLead"));

  if (!isAdmin && !isIgLead) {
    redirect("/dashboard?unauthorized=true");
  }

  return <ManageInterestGroupsPageClient />;
}
