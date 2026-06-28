import type { Metadata } from "next";
import { CAMPUS_SETTINGS_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";
import { ChangeOrganizationPageClient } from "./organization-settings-client";

export const metadata: Metadata = {
  title: "Organization Settings",
  description: "Manage your organization settings.",
};

export default async function OrganizationSettingsPage() {
  await requireRole(CAMPUS_SETTINGS_ROLES);
  return <ChangeOrganizationPageClient />;
}
