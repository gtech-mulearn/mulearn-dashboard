import { INTERN_MANAGEMENT_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";
import { TeamsPageClient } from "./teams-client";

export const metadata = {
  title: "Teams | Management",
};

export default async function Page() {
  await requireRole(INTERN_MANAGEMENT_ROLES);
  return <TeamsPageClient />;
}
