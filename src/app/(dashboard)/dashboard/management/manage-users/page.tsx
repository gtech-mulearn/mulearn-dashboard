import type { Metadata } from "next";
import ManageUsers from "@/features/manage-users/components/manage-user-page";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Manage Users",
  description: "Add, edit, and delete user accounts.",
};

export default async function Page() {
  await requireRole([ROLES.ADMIN]);
  return <ManageUsers />;
}
