/**
 * Connected apps (OAuth clients for "Sign in with µLearn").
 *
 * Route: /dashboard/management/system/applications
 * RBAC: Admins. The backend also checks for a verified Admins role link.
 */

import type { Metadata } from "next";
import { ConnectedAppsPage } from "@/features/connected-apps";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Connected apps | System & Configurations",
  description: "Register and manage the apps that use Sign in with µLearn.",
};

export default async function ConnectedAppsRoute() {
  await requireRole(ADMIN_ROLES);
  return <ConnectedAppsPage />;
}
