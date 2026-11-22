import type { Metadata } from "next";
import { CompanyFeedbackPageClient } from "@/features/company-jobs";

export const metadata: Metadata = {
  title: "Impact & Feedback | μLearn",
  description:
    "View company impact metrics, publish reports, and explore community feedback.",
};

export default function CompanyFeedbackPage() {
  return <CompanyFeedbackPageClient />;
}
