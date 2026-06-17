import type { Metadata } from "next";
import { TasksView } from "@/features/tasks";

export const metadata: Metadata = {
  title: "Tasks",
  description: "Manage tasks and assignments.",
};

export default function TasksPage() {
  return <TasksView />;
}
