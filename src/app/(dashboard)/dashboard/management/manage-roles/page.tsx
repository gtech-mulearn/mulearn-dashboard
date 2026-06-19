import type { Metadata } from "next";
import ManageRoles from "@/features/manage-roles/components/roles-table";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Manage Roles",
  description: "Create and configure user role permissions.",
};

export default async function Page() {
  await requireRole([ROLES.ADMIN]);
  return <ManageRoles />;
}
