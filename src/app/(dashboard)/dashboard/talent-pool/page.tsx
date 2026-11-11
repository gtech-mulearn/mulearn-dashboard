import type { Metadata } from "next";
import { CompanyAccessGate } from "@/features/company-jobs/components/company-access-gate";
import { TalentPoolPageClient } from "./talent-pool-client";

export const metadata: Metadata = {
  title: "Talent Pool",
  description: "Browse and manage the talent pool.",
};

export default function TalentPoolPage() {
  return (
    <CompanyAccessGate capability="viewTalentPool">
      <TalentPoolPageClient />
    </CompanyAccessGate>
  );
}
