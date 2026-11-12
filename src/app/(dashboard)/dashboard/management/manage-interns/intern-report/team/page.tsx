import { INTERN_MANAGEMENT_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";
import { TeamReportPageClient } from "./team-report-client";

export const metadata = {
  title: "Team Report | Management",
};

export default async function Page() {
  await requireRole(INTERN_MANAGEMENT_ROLES);
  return <TeamReportPageClient />;
}
