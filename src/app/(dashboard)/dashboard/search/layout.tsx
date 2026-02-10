/**
 * Search Layout
 *
 * 📍 src/app/(dashboard)/dashboard/search/layout.tsx
 *
 * Layout for search pages with navigation tabs
 */

import type { ReactNode } from "react";

interface SearchLayoutProps {
  children: ReactNode;
}

export default function SearchLayout({ children }: SearchLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Find & Connect
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Browse and connect with members across our global community to share
            knowledge and grow together.
          </p>
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}
