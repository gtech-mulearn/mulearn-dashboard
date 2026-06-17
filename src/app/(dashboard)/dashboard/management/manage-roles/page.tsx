import type { Metadata } from "next";
import ManageRoles from "@/features/manage-roles/components/roles-table";

export const metadata: Metadata = {
  title: "Manage Roles",
  description: "Create and configure user role permissions.",
};

export default function Page() {
  return <ManageRoles />;
}
