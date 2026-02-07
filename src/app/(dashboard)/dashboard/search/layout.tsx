/**
 * Search Layout
 *
 * 📍 src/app/(dashboard)/dashboard/search/layout.tsx
 *
 * Layout for search pages with navigation tabs
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SearchLayoutProps {
  children: ReactNode;
}

const searchTabs = [
  { label: "Students", href: "/dashboard/search/students" },
  { label: "Mentors", href: "/dashboard/search/mentors" },
  { label: "Campuses", href: "/dashboard/search/campuses" },
];

export default function SearchLayout({ children }: SearchLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Search Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {searchTabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "border-b-2 px-1 pb-4 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Page Content */}
      {children}
    </div>
  );
}
