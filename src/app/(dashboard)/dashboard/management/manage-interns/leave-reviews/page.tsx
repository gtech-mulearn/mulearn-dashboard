import { INTERN_MANAGEMENT_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";
import { LeaveReviewsPageClient } from "./leave-reviews-client";

export const metadata = {
  title: "Leave Reviews | Management",
};

export default async function Page() {
  await requireRole(INTERN_MANAGEMENT_ROLES);
  return <LeaveReviewsPageClient />;
}
