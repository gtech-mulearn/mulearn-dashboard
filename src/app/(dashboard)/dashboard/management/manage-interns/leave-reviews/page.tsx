import { requireRole } from "@/lib/auth/server";
import { ROLES } from "@/lib/auth/roles";
import { LeaveReviewsPageClient } from "./leave-reviews-client";

export const metadata = {
  title: "Leave Reviews | Management",
};

export default async function Page() {
  await requireRole([ROLES.ADMIN, ROLES.ASSOCIATE]);
  return <LeaveReviewsPageClient />;
}
