/**
 * Dashboard Content Wrapper
 *
 * 📍 src/components/layout/dashboard-content.tsx
 *
 * Client component that wraps dashboard content.
 * Dynamically adjusts left margin based on sidebar state.
 */

"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

interface DashboardContentProps {
  children: ReactNode;
}

export function DashboardContent({ children }: DashboardContentProps) {
  const { isSidebarExpanded } = useUIStore();

  return (
    <main
      className={cn(
        "min-h-screen pt-16 lg:pt-0 w-full overflow-x-hidden",
        isSidebarExpanded ? "lg:ml-64" : "lg:ml-16",
      )}
    >
      <div className="p-2 lg:p-4">
        <div className="bg-background rounded-2xl shadow-sm p-4 lg:p-6">
          {children}
        </div>
      </div>
    </main>
  );
}
