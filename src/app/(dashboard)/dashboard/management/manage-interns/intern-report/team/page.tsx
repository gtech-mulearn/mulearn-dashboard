import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";
import { TeamReportPageClient } from "./team-report-client";

export const metadata = {
  title: "Team Report | Management",
};

export default async function Page() {
  await requireRole([ROLES.ADMIN, ROLES.ASSOCIATE]);
  return <TeamReportPageClient />;
}
