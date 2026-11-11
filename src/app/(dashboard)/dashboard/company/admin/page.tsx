import type { Metadata } from "next";
import { CompanyAdminsPageClient } from "@/features/company-jobs/components/admin/company-admins-client";

export const metadata: Metadata = {
  title: "Company Administrators | μLearn",
  description: "Manage company co-administrators and team invitations.",
};

export default function CompanyAdminsPage() {
  return <CompanyAdminsPageClient />;
}
