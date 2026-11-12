import { INTERN_MANAGEMENT_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";
import { InternReportPageClient } from "./intern-report-client";

export const metadata = {
  title: "Intern Report | Management",
};

export default async function Page() {
  await requireRole(INTERN_MANAGEMENT_ROLES);
  return <InternReportPageClient />;
}
