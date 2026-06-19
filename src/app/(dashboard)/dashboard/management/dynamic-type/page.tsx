/**
 * Dynamic Type Admin Page
 *
 * Route: /dashboard/management/dynamic-type
 * RBAC: Admin only
 */

import { DynamicTypePage } from "@/features/dynamic-type";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata = {
  title: "Manage Dynamic Types | Management",
  description:
    "Configure dynamic role-type and user-type mappings for the MuLearn platform.",
};

export default async function DynamicTypeAdminPage() {
  await requireRole([ROLES.ADMIN]);
  return <DynamicTypePage />;
}
