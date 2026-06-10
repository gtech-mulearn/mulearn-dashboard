"use client";

import { useState } from "react";
import { LeaveFormDialog } from "@/features/intern";
import { ActiveQuests } from "./components/active-quests";
import { EliteLeaders } from "./components/elite-leaders";
import { InternHeader } from "./components/intern-header";
import { InternStatsCards } from "./components/intern-stats-cards";
import { QuestLog } from "./components/quest-log";

export default function InternDashboardPage() {
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto w-full bg-background/50">
      {/* Header Section */}
      <InternHeader onApplyLeave={() => setIsLeaveOpen(true)} />

      {/* KPI Overview Cards */}
      <InternStatsCards />

      <div className="grid gap-6 md:grid-cols-7">
        {/* Main Content Column (2/3 width) */}
        <div className="md:col-span-4 lg:col-span-5 space-y-8">
          {/* Active Quests (Quick Actions) */}
          <ActiveQuests />

          {/* Elite Leaders (Table Integration) */}
          <EliteLeaders />
        </div>

        {/* Sidebar Column (1/3 width) */}
        <div className="md:col-span-3 lg:col-span-2">
          <QuestLog />
        </div>
      </div>

      <LeaveFormDialog open={isLeaveOpen} onOpenChange={setIsLeaveOpen} />
    </div>
  );
}
