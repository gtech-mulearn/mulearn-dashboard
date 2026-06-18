import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";
import { InternReportPageClient } from "./intern-report-client";

export const metadata = {
  title: "Intern Report | Management",
};

export default async function Page() {
  await requireRole([ROLES.ADMIN, ROLES.ASSOCIATE]);
  return <InternReportPageClient />;
}
