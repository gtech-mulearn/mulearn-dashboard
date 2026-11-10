import { INTERN_MANAGEMENT_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";
import { TimesheetReviewsPageClient } from "./timesheet-reviews-client";

export const metadata = {
  title: "Timesheet Reviews | Management",
};

export default async function Page() {
  await requireRole(INTERN_MANAGEMENT_ROLES);
  return <TimesheetReviewsPageClient />;
}
