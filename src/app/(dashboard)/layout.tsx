/**
 * Dashboard Layout
 *
 * 📍 src/app/(dashboard)/layout.tsx
 *
 * Layout for dashboard and protected routes.
 * Includes sidebar navigation, onboarding guard, and RBAC unauthorized handler.
 */

import { type ReactNode, Suspense } from "react";
import { UnauthorizedHandler } from "@/components/auth";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { AppTopbar } from "@/components/dashboard/app-topbar";
import { DashboardSidebarProvider } from "@/components/dashboard/sidebar-provider";
import { DashboardContent } from "@/components/layout/dashboard-content";
import { OnboardingGuard } from "./onboarding-guard";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <OnboardingGuard>
      {/* Catches ?unauthorized=true from middleware RBAC redirects */}
      <Suspense fallback={null}>
        <UnauthorizedHandler />
      </Suspense>
      <DashboardSidebarProvider>
        <main className="min-h-screen bg-muted/40">
          <AppTopbar />
          <AppSidebar />
          <DashboardContent>{children}</DashboardContent>
        </main>
      </DashboardSidebarProvider>
    </OnboardingGuard>
  );
}
