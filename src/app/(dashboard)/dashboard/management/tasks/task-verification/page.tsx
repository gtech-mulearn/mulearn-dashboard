import type { Metadata } from "next";
import { TaskVerificationView } from "@/features/tasks";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Task Verification",
  description: "Review, approve, and verify pending tasks.",
};

export default async function TaskVerificationPage() {
  await requireRole([ROLES.ADMIN]);
  return <TaskVerificationView />;
}
