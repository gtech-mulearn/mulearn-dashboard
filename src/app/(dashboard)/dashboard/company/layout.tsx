import type { ReactNode } from "react";
import { CompanyAccessGate } from "@/features/company-jobs";

interface CompanyLayoutProps {
  children: ReactNode;
}

export default function CompanyLayout({ children }: CompanyLayoutProps) {
  return <CompanyAccessGate>{children}</CompanyAccessGate>;
}
