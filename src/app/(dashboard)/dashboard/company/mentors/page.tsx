import type { Metadata } from "next";
import { MentorsPage } from "@/features/company-mentors/components/mentors-page";

export const metadata: Metadata = {
  title: "Company Mentors | μLearn",
  description: "Nominate and manage mentors for your company",
};

export default function CompanyMentorsRoute() {
  return <MentorsPage />;
}
