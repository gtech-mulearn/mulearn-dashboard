/**
 * Dynamic Type Admin Page
 *
 * 📍 src/app/(dashboard)/dashboard/management/dynamic-type/page.tsx
 *
 * Route: /dashboard/management/dynamic-type
 * RBAC: Admin only (protected by route-access.ts)
 */

import { DynamicTypePage } from "@/features/dynamic-type";

export const metadata = {
  title: "Manage Dynamic Types | MuLearn Dashboard",
  description:
    "Configure dynamic role-type and user-type mappings for the MuLearn platform.",
};

export default function DynamicTypeAdminPage() {
  return <DynamicTypePage />;
}
