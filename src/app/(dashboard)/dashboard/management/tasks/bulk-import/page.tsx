import type { Metadata } from "next";
import { TaskBulkImportView } from "@/features/tasks";

export const metadata: Metadata = {
  title: "Tasks Bulk Import",
  description: "Bulk-import tasks via CSV.",
};

export default function TaskBulkImportPage() {
  return <TaskBulkImportView />;
}
