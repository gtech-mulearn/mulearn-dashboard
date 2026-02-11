/**
 * Dashboard Layout
 *
 * 📍 src/app/(dashboard)/layout.tsx
 *
 * Layout for dashboard and protected routes.
 * Includes sidebar navigation, onboarding guard, and RBAC unauthorized handler.
 */

import { Suspense, type ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardContent } from "@/components/layout/dashboard-content";
import { UnauthorizedHandler } from "@/components/auth";
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
      <div className="min-h-screen bg-gray-50 flex justify-between">
        <Sidebar />
        <DashboardContent>{children}</DashboardContent>
      </div>
    </OnboardingGuard>
  );
}
