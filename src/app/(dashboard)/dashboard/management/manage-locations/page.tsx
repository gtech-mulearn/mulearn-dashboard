import type { Metadata } from "next";
import { LocationManagementPage } from "@/features/manage-locations";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Manage Locations",
  description: "Manage geographical locations for events and users.",
};

export default async function Page() {
  await requireRole(ADMIN_ROLES);
  return <LocationManagementPage />;
}
