import type { Metadata } from "next";
import { TaskTypeView } from "@/features/tasks";

export const metadata: Metadata = {
  title: "Task Types",
  description: "Manage task types and categories.",
};

export default function TaskTypePage() {
  return <TaskTypeView />;
}
