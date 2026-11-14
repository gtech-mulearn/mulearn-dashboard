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
import { DashboardOverlays } from "@/components/dashboard/dashboard-overlays";
import { DashboardSidebarProvider } from "@/components/dashboard/sidebar-provider";
import { DashboardContent } from "@/components/layout/dashboard-content";
import { getTourState } from "@/features/tour";
import { getLatestChangelogEntry, shouldShowWhatsNew } from "@/lib/whats-new";
import { OnboardingGuard } from "./onboarding-guard";
import {
  dismissWhatsNew,
  getWhatsNewState,
  markWhatsNewSeen,
} from "./whats-new-actions";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const [entry, state, tourState] = await Promise.all([
    getLatestChangelogEntry(),
    getWhatsNewState(),
    getTourState(),
  ]);
  const shouldShow = shouldShowWhatsNew(entry, state);

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
          <DashboardOverlays
            entry={entry}
            whatsNewOpen={shouldShow}
            onWhatsNewSeen={markWhatsNewSeen}
            onWhatsNewDismiss={dismissWhatsNew}
            tourInitialState={tourState}
          />
        </main>
      </DashboardSidebarProvider>
    </OnboardingGuard>
  );
}
