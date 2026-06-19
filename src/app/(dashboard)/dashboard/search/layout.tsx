/**
 * Search Layout
 *
 * 📍 src/app/(dashboard)/dashboard/search/layout.tsx
 *
 * Layout for search pages with navigation tabs
 */

import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/page-header";

interface SearchLayoutProps {
  children: ReactNode;
}

export default function SearchLayout({ children }: SearchLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Header */}
      <PageHeader
        title="Find & Connect"
        description="Browse and connect with members across our global community to share knowledge and grow together."
        className="mb-10"
      />

      {/* Page Content */}
      {children}
    </div>
  );
}
