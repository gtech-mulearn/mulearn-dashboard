import type { Metadata } from "next";
import { InternDashboardPageClient } from "./intern-client";

export const metadata: Metadata = {
  title: "Intern Dashboard",
  description: "Manage your internship activities.",
};

export default function InternDashboardPage() {
  return <InternDashboardPageClient />;
}
