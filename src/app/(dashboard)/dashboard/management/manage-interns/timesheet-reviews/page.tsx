import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";
import { TimesheetReviewsPageClient } from "./timesheet-reviews-client";

export const metadata = {
  title: "Timesheet Reviews | Management",
};

export default async function Page() {
  await requireRole([ROLES.ADMIN, ROLES.ASSOCIATE]);
  return <TimesheetReviewsPageClient />;
}
