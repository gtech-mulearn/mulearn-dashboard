import { TaskRequestsPage } from "@/features/mentor/task-requests/components/task-requests-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Task Requests",
  description: "Review and manage mentor task requests.",
};

export default function MentorTaskRequestsRoute() {
  return <TaskRequestsPage />;
}
