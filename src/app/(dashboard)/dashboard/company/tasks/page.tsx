import type { Metadata } from "next";
import { CompanyTasksPage } from "@/features/company-tasks/components/tasks-page";

export const metadata: Metadata = {
  title: "Company Tasks | μLearn",
  description: "Manage your company's tasks",
};

export default function TasksPage() {
  return <CompanyTasksPage />;
}
