/**
 * Register a connected app.
 *
 * Route: /dashboard/management/system/applications/new
 * RBAC: Admins
 */

import type { Metadata } from "next";
import { RegisterAppPage } from "@/features/connected-apps";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Register an app | Connected apps",
  description: "Register an app for Sign in with µLearn.",
};

export default async function RegisterAppRoute() {
  await requireRole(ADMIN_ROLES);
  return <RegisterAppPage />;
}
