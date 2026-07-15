import type { Metadata } from "next";
import { TasksView } from "@/features/tasks";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Tasks List | Management",
  description: "View and manage tasks.",
};

export default async function TasksListPage() {
  await requireRole([ROLES.ADMIN]);
  return <TasksView />;
}
