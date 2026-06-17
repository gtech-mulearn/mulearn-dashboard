import type { Metadata } from "next";
import { TaskCreateView } from "@/features/tasks";

export const metadata: Metadata = {
  title: "Create Task",
  description: "Create a new task for interest groups.",
};

export default function TaskCreatePage() {
  return <TaskCreateView />;
}
