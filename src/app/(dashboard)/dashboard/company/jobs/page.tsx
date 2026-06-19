import type { Metadata } from "next";
import { CompanyJobsPageClient } from "./company-jobs-client";

export const metadata: Metadata = {
  title: "Company Jobs",
  description: "Manage your company job listings.",
};

export default function CompanyJobsPage() {
  return <CompanyJobsPageClient />;
}
