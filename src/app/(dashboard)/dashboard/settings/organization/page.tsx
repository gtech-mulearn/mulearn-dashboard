import type { Metadata } from "next";
import { ChangeOrganizationPageClient } from "./organization-settings-client";

export const metadata: Metadata = {
  title: "Organization Settings",
  description: "Manage your organization settings.",
};

export default function OrganizationSettingsPage() {
  return <ChangeOrganizationPageClient />;
}
