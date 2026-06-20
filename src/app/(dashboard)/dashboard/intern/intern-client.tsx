"use client";

import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { SectionErrorFallback } from "@/components/ui/errors/SectionErrorFallback";
import { LeaveFormDialog } from "@/features/intern";
import { ActiveQuests } from "../../../../features/intern/components/active-quests";
import { QuestLog } from "../../../../features/intern/components/activity-log";
import { InternHeader } from "../../../../features/intern/components/intern-header";
import { InternStatsCards } from "../../../../features/intern/components/intern-stats-cards";
import { EliteLeaders } from "../../../../features/intern/components/leaderboard";

export function InternDashboardPageClient() {
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <ErrorBoundary FallbackComponent={SectionErrorFallback}>
        <InternHeader />
      </ErrorBoundary>

      {/* KPI Overview Cards */}
      <ErrorBoundary FallbackComponent={SectionErrorFallback}>
        <InternStatsCards />
      </ErrorBoundary>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Main Content Column (2/3 width) */}
        <div className="md:col-span-4 lg:col-span-5 space-y-8">
          {/* Active Quests (Quick Actions) */}
          <ErrorBoundary FallbackComponent={SectionErrorFallback}>
            <ActiveQuests />
          </ErrorBoundary>

          {/* Elite Leaders (Table Integration) */}
          <ErrorBoundary FallbackComponent={SectionErrorFallback}>
            <EliteLeaders />
          </ErrorBoundary>
        </div>

        {/* Sidebar Column (1/3 width) */}
        <div className="md:col-span-3 lg:col-span-2">
          <ErrorBoundary FallbackComponent={SectionErrorFallback}>
            <QuestLog />
          </ErrorBoundary>
        </div>
      </div>

      <LeaveFormDialog open={isLeaveOpen} onOpenChange={setIsLeaveOpen} />
    </div>
  );
}
