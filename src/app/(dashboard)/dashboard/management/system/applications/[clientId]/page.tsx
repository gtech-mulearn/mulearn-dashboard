/**
 * One connected app.
 *
 * Route: /dashboard/management/system/applications/[clientId]
 * RBAC: Admins
 */

import type { Metadata } from "next";
import { AppDetailPage } from "@/features/connected-apps";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "App | Connected apps",
  description: "Settings and status of a connected app.",
};

interface Props {
  params: Promise<{ clientId: string }>;
}

export default async function AppDetailRoute({ params }: Props) {
  await requireRole(ADMIN_ROLES);
  const { clientId } = await params;
  return <AppDetailPage clientId={decodeURIComponent(clientId)} />;
}
