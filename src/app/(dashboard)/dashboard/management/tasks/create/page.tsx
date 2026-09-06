import type { Metadata } from "next";
import { TaskCreateView } from "@/features/tasks";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Create Task",
  description: "Create a new task for interest groups.",
};

export default async function TaskCreatePage() {
  await requireRole(ADMIN_ROLES);
  return <TaskCreateView />;
}
