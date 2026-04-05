import type { ReactNode } from "react";

interface CompanyLayoutProps {
  children: ReactNode;
}

export default function CompanyLayout({ children }: CompanyLayoutProps) {
  return <>{children}</>;
}
