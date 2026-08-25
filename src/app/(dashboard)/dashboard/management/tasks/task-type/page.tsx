import type { Metadata } from "next";
import { TaskTypeView } from "@/features/tasks";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Task Types",
  description: "Manage task types and categories.",
};

export default async function TaskTypePage() {
  await requireRole(ADMIN_ROLES);
  return <TaskTypeView />;
}
