import type { Metadata } from "next";
import ManageRoles from "@/features/manage-roles/components/roles-table";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Manage Roles",
  description: "Create and configure user role permissions.",
};

export default async function Page() {
  await requireRole(ADMIN_ROLES);
  return <ManageRoles />;
}
