import type { Metadata } from "next";
import { OrganizationsView } from "@/features/organizations";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Organizations List | Management",
  description: "View and manage organizations.",
};

export default async function OrganizationsListPage() {
  await requireRole([ROLES.ADMIN]);
  return <OrganizationsView />;
}
