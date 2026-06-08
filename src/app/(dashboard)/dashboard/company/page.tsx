import type { Metadata } from "next";
import CompanyDashboardClient from "./company-dashboard-client";

export const metadata: Metadata = {
  title: "Company Dashboard | μLearn",
  description: "Manage your Company Jobs, Tasks, and Mentors",
};

export default function CompanyDashboardPage() {
  return <CompanyDashboardClient />;
}
