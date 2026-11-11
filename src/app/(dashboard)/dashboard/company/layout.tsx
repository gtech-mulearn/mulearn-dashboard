import type { ReactNode } from "react";
import { CompanyAccessGate } from "@/features/company-jobs/components/company-access-gate";

interface CompanyLayoutProps {
  children: ReactNode;
}

export default function CompanyLayout({ children }: CompanyLayoutProps) {
  return <CompanyAccessGate>{children}</CompanyAccessGate>;
}
