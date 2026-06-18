import type { Metadata } from "next";
import { InternTasksPageClient } from "./intern-task-client";

export const metadata: Metadata = {
  title: "Intern Tasks",
  description: "View and manage internship tasks.",
};

export default function InternTasksPage() {
  return <InternTasksPageClient />;
}
