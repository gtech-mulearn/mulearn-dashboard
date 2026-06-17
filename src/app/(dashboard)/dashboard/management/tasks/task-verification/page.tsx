import type { Metadata } from "next";
import { TaskVerificationView } from "@/features/tasks";

export const metadata: Metadata = {
  title: "Task Verification",
  description: "Review, approve, and verify pending tasks.",
};

export default function TaskVerificationPage() {
  return <TaskVerificationView />;
}
