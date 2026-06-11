import { MentorsPage } from "@/features/company-mentors/components/mentors-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company Mentors | μLearn",
  description: "Nominate and manage mentors for your company",
};

export default function CompanyMentorsRoute() {
  return <MentorsPage />;
}
