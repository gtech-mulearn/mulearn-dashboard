import { requireRole } from "@/lib/auth/server";
import { ROLES } from "@/lib/auth/roles";
import { IndividualReportPageClient } from "./individual-report-client";

export const metadata = {
  title: "Individual Report | Management",
};

export default async function Page() {
  await requireRole([ROLES.ADMIN, ROLES.ASSOCIATE]);
  return <IndividualReportPageClient />;
}
