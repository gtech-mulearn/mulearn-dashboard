"use client";

import type { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useUIStore } from "@/stores/ui-store";

export function DashboardSidebarProvider({
  children,
}: {
  children: ReactNode;
}) {
  const open = useUIStore((s) => s.isSidebarExpanded);
  const setOpen = useUIStore((s) => s.setSidebarExpanded);

  return (
    <SidebarProvider
      open={open}
      onOpenChange={setOpen}
      style={
        {
          "--sidebar-width": "15rem",
        } as React.CSSProperties
      }
      className="contents"
    >
      {children}
    </SidebarProvider>
  );
}
