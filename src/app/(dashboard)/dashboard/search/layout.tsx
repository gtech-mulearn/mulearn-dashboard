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
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <PageHeader
          title="Find & Connect"
          description="Browse and connect with members across our global community to share knowledge and grow together."
          className="mb-10"
        />

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}
