/**
 * Error Log Admin Page
 *
 * Route: /dashboard/management/error-log
 * RBAC: Admin + Tech Team
 */

import { requireRole } from "@/lib/auth/server";
import { ROLES } from "@/lib/auth/roles";
import { ErrorLogPage } from "@/features/error-log";

export const metadata = {
  title: "System Error Log | Management",
  description:
    "View, download, and manage backend error logs for the MuLearn platform.",
};

export default async function ErrorLogAdminPage() {
  await requireRole([ROLES.ADMIN, ROLES.TECH_TEAM]);
  return <ErrorLogPage />;
}
