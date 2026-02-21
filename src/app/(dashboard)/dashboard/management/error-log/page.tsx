/**
 * Error Log Admin Page
 *
 * 📍 src/app/(dashboard)/dashboard/management/error-log/page.tsx
 *
 * Route: /dashboard/management/error-log
 * RBAC: Admin + Tech Team (protected by route-access.ts)
 */

import { ErrorLogPage } from "@/features/error-log";

export const metadata = {
  title: "System Error Log | MuLearn Dashboard",
  description:
    "View, download, and manage backend error logs for the MuLearn platform.",
};

export default function ErrorLogAdminPage() {
  return <ErrorLogPage />;
}
