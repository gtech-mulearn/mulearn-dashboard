import { INTERN_MANAGEMENT_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";
import { IndividualReportPageClient } from "./individual-report-client";

export const metadata = {
  title: "Individual Report | Management",
};

export default async function Page() {
  await requireRole(INTERN_MANAGEMENT_ROLES);
  return <IndividualReportPageClient />;
}
