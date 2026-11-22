import type { Metadata } from "next";
import { CompanySponsorshipPageClient } from "@/features/company-jobs";

export const metadata: Metadata = {
  title: "Interest Group Sponsorships | μLearn",
  description:
    "Sponsor specialized interest groups, fund learner tasks, and build talent pipelines.",
};

export default function CompanySponsorshipPage() {
  return <CompanySponsorshipPageClient />;
}
