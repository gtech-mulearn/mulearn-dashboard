import type { Metadata } from "next";
import { CompanyTemplatesPageClient } from "@/features/company-jobs/components/templates/company-templates-client";

export const metadata: Metadata = {
  title: "Templates Management | μLearn",
  description: "Create and manage reusable task and event templates.",
};

export default function CompanyTemplatesPage() {
  return <CompanyTemplatesPageClient />;
}
