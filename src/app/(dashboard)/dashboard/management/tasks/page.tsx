import type { Metadata } from "next";
import { TasksView } from "@/features/tasks";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Tasks",
  description: "Manage tasks and assignments.",
};

export default async function TasksPage() {
  await requireRole([ROLES.ADMIN]);
  return <TasksView />;
}
