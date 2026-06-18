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
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ConnectAccountsBanner } from "../dashboard/connect-banner";

interface DashboardContentProps {
  children: ReactNode;
}

export function DashboardContent({ children }: DashboardContentProps) {
  const { state } = useSidebar();
  const isSidebarExpanded = state === "expanded";

  return (
    <main
      className={cn(
        "min-h-screen w-full overflow-x-hidden transition-[padding-left] duration-200 ease-linear",
        "pt-20 pl-4 pr-4 pb-4",
        isSidebarExpanded ? "lg:pl-[248px]" : "lg:pl-[56px]",
      )}
    >
      <div className="bg-background rounded-2xl shadow-sm p-4 min-h-[calc(100vh-6rem)]">
        {children}
        <ConnectAccountsBanner />
      </div>
    </main>
  );
}
