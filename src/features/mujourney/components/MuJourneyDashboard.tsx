"use client";

/**
 * MuJourney Dashboard Component
 *
 * 📍 src/features/mujourney/components/MuJourneyDashboard.tsx
 *
 * Orchestrates the three journey tabs using the redesigned unified task list API.
 * IG pill selection triggers a full refetch of the task list with ?ig_id=<uuid>,
 * which replaces the become_expert section with only that IG's tasks.
 */

import { useState } from "react";
import { useInterestGroups } from "../hooks/useInterestGroups";
import { useTaskList } from "../hooks/useTaskList";
import { BecomeExpertTab } from "./BecomeExpertTab";
import { EventsTab } from "./EventsTab";
import { JourneyHeader } from "./JourneyHeader";
import { JourneyTabs } from "./JourneyTabs";
import { StartLearningTab } from "./StartLearningTab";

// ─── Component ───────────────────────────────────────────────────────────────

export function MuJourneyDashboard() {
  const [activeTab, setActiveTab] = useState("start-learning");
  const [filter, setFilter] = useState("all");
  const [selectedIG, setSelectedIG] = useState<string | null>(null);

  // ── Unified task list query ─────────────────────────────────────────────
  const {
    data: taskListData,
    isLoading: taskListLoading,
    error: taskListError,
    isFetching: taskListFetching,
  } = useTaskList({
    igId: selectedIG ?? undefined,
  });

  // ── Interest Groups query (for pill labels + edit modal) ────────────────
  const { data: igData, isLoading: igLoading } = useInterestGroups();

  // ── Extract sections from the API response ──────────────────────────────
  const startJourneyTasks = taskListData?.response?.start_journey ?? [];
  const becomeExpertTasks = taskListData?.response?.become_expert ?? [];
  const eventsTasks = taskListData?.response?.events ?? [];

  const interestGroups = igData?.response?.aois ?? [];

  // ── IG pill toggle handler ──────────────────────────────────────────────
  const handleIGToggle = (igId: string) => {
    const newIG = selectedIG === igId ? null : igId;
    setSelectedIG(newIG);
  };

  // ── Tabs ────────────────────────────────────────────────────────────────
  const tabs = [
    { id: "start-learning", label: "Start Journey" },
    { id: "become-expert", label: "Become Expert" },
    { id: "events", label: "Events" },
  ];

  const isLoading = taskListLoading;
  const isBgFetching = !taskListLoading && taskListFetching;

  return (
    <div className="space-y-8">
      {/* Header */}
      <JourneyHeader
        title="µJourney"
        subtitle="Your Learning Path — Complete tasks, earn karma, level up"
      />

      {/* Tab navigation + Filter dropdown */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <JourneyTabs
          tabs={tabs}
          defaultTab="start-learning"
          onTabChange={(tab) => {
            setActiveTab(tab);
            setFilter("all");
          }}
        />

        {/* Filter by: dropdown — shown for Start Journey & Become Expert */}
        {(activeTab === "start-learning" || activeTab === "become-expert") && (
          <div className="flex items-center gap-3">
            <span className="text-base font-medium text-foreground">
              Filter by:
            </span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-5 py-2.5 border border-border rounded-lg bg-card text-base font-medium text-card-foreground cursor-pointer hover:border-ring transition-colors [&>option]:cursor-pointer outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="mt-8 relative min-h-[400px]">
        {activeTab === "start-learning" && (
          <StartLearningTab
            filter={filter}
            tasks={startJourneyTasks}
            isLoading={isLoading}
            isFetching={isBgFetching}
            error={taskListError}
          />
        )}

        {activeTab === "become-expert" && (
          <BecomeExpertTab
            filter={filter}
            tasks={becomeExpertTasks}
            isLoading={isLoading}
            error={taskListError}
            selectedIG={selectedIG}
            interestGroups={interestGroups}
            igLoading={igLoading}
            onIGToggle={handleIGToggle}
          />
        )}

        {activeTab === "events" && (
          <EventsTab
            tasks={eventsTasks}
            isLoading={isLoading}
            isFetching={isBgFetching}
            error={taskListError}
          />
        )}
      </div>
    </div>
  );
}
