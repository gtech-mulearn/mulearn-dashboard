import type { Metadata } from "next";
import { TaskRequestsPage } from "@/features/mentor";

export const metadata: Metadata = {
  title: "Task Requests",
  description: "Review and manage mentor task requests.",
};

export default function MentorTaskRequestsRoute() {
  return <TaskRequestsPage />;
}
