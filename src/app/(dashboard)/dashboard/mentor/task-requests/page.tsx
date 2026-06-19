import type { Metadata } from "next";
import { TaskRequestsPage } from "@/features/mentor/task-requests/components/task-requests-page";

export const metadata: Metadata = {
  title: "Task Requests",
  description: "Review and manage mentor task requests.",
};

export default function MentorTaskRequestsRoute() {
  return <TaskRequestsPage />;
}
