import type { Metadata } from "next";
import { TaskBulkImportView } from "@/features/tasks";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Tasks Bulk Import",
  description: "Bulk-import tasks via CSV.",
};

export default async function TaskBulkImportPage() {
  await requireRole(ADMIN_ROLES);
  return <TaskBulkImportView />;
}
