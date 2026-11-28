"use client";

import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { SectionErrorFallback } from "@/components/ui/errors/SectionErrorFallback";
import {
  ActiveQuests,
  EliteLeaders,
  InternHeader,
  InternStatsCards,
  LeaveFormDialog,
  QuestLog,
} from "@/features/intern";

export function InternDashboardPageClient() {
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);

  return (
    <div className="w-full space-y-8">
      {/* Header Section */}
      <div data-tour-id="page:intern-dashboard:header">
        <ErrorBoundary FallbackComponent={SectionErrorFallback}>
          <InternHeader />
        </ErrorBoundary>
      </div>

      {/* KPI Overview Cards */}
      <div data-tour-id="page:intern-dashboard:stats">
        <ErrorBoundary FallbackComponent={SectionErrorFallback}>
          <InternStatsCards />
        </ErrorBoundary>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Main Content Column (2/3 width) */}
        <div className="md:col-span-4 lg:col-span-5 space-y-8">
          {/* Active Quests (Quick Actions) */}
          <div data-tour-id="page:intern-dashboard:active-quests">
            <ErrorBoundary FallbackComponent={SectionErrorFallback}>
              <ActiveQuests />
            </ErrorBoundary>
          </div>

          {/* Elite Leaders (Table Integration) */}
          <div data-tour-id="page:intern-dashboard:leaderboard-preview">
            <ErrorBoundary FallbackComponent={SectionErrorFallback}>
              <EliteLeaders />
            </ErrorBoundary>
          </div>
        </div>

        {/* Sidebar Column (1/3 width) */}
        <div
          className="md:col-span-3 lg:col-span-2"
          data-tour-id="page:intern-dashboard:quest-log"
        >
          <ErrorBoundary FallbackComponent={SectionErrorFallback}>
            <QuestLog />
          </ErrorBoundary>
        </div>
      </div>

      <LeaveFormDialog open={isLeaveOpen} onOpenChange={setIsLeaveOpen} />
    </div>
  );
}
