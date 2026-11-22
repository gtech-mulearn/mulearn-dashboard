import type { Metadata } from "next";
import { CompanyCollaborationsPageClient } from "@/features/company-jobs";

export const metadata: Metadata = {
  title: "Company Collaborations | μLearn",
  description:
    "Explore joint corporate initiatives, hackathons, and task sponsorships.",
};

export default function CompanyCollaborationsPage() {
  return <CompanyCollaborationsPageClient />;
}
