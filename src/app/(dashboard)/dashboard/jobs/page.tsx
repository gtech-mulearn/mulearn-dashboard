import type { Metadata } from "next";
import { LearnerJobsPageClient } from "./jobs-page-client";

export const metadata: Metadata = {
  title: "Jobs",
  description: "Browse and manage job listings.",
};

export default function JobsPage() {
  return <LearnerJobsPageClient />;
}
