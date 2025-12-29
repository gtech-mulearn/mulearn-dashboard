/**
 * Dashboard Layout
 *
 * 📍 src/app/(dashboard)/layout.tsx
 *
 * Layout for dashboard and protected routes.
 * Includes sidebar navigation and onboarding guard.
 */

import type { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { OnboardingGuard } from "./onboarding-guard";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <OnboardingGuard>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        {/* Main content with left margin for sidebar */}
        <main className="lg:ml-64 min-h-screen transition-all duration-300">
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </OnboardingGuard>
  );
}
