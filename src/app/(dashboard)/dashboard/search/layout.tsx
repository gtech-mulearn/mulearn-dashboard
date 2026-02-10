/**
 * Search Layout
 *
 * 📍 src/app/(dashboard)/dashboard/search/layout.tsx
 *
 * Layout for search pages with navigation tabs
 */

import type { ReactNode } from "react";
import { SearchTabsClient } from "@/features/search";

interface SearchLayoutProps {
  children: ReactNode;
}

const searchTabs = [
  { label: "Students", href: "/dashboard/search/students" },
  { label: "Mentors", href: "/dashboard/search/mentors" },
  { label: "Campuses", href: "/dashboard/search/campuses" },
];

export default function SearchLayout({ children }: SearchLayoutProps) {
  return (
    <div className="space-y-6">
      <SearchTabsClient tabs={searchTabs} />
      {children}
    </div>
  );
}
