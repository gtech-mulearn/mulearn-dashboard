"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { LearnerTasksPage } from "@/features/home/components/learner-tasks-page";
import {
  BecomeExpertTab,
  EventsTab,
  JourneyHeader,
  JourneyTabs,
  StartLearningTab,
  useInterestGroups,
  useStartLearning,
} from "@/features/mujourney";
import type { GetUserLevelsResponse } from "@/features/mujourney/schemas";

interface MuJourneyDashboardProps {
  initialLevels: GetUserLevelsResponse | null;
  isAuthenticated: boolean;
}

export function MuJourneyDashboard({
  initialLevels,
  isAuthenticated,
}: MuJourneyDashboardProps) {
  const [activeTab, setActiveTab] = useState("start-learning");
  const [filter, setFilter] = useState("all");

  const {
    data: levelsData,
    isLoading: levelsLoading,
    error: levelsError,
  } = useStartLearning(initialLevels);

  const {
    data: igData,
    isLoading: igLoading,
    error: igError,
  } = useInterestGroups();

  const tabs = [
    { id: "start-learning", label: "Start Journey" },
    { id: "become-expert", label: "Become Expert" },
    { id: "events", label: "Events" },
    { id: "tasks", label: "Tasks" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <JourneyHeader
          title="µJourney"
          subtitle="Your Learning Path - Complete tasks, earn karma, level up"
        />
      </motion.div>

      {/* Tab Navigation & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <JourneyTabs
          tabs={tabs}
          defaultTab="start-learning"
          onTabChange={setActiveTab}
        />

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
              <option value="all" className="cursor-pointer">
                All
              </option>
              <option value="completed" className="cursor-pointer">
                Completed
              </option>
              <option value="incomplete" className="cursor-pointer">
                Incomplete
              </option>
            </select>
          </div>
        )}
      </div>

      {/* Tab Content with Animations */}
      <div className="mt-8 relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === "start-learning" && (
            <motion.div
              key="start-learning"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <StartLearningTab
                filter={filter}
                levelsData={levelsData}
                isLoading={levelsLoading}
                error={levelsError}
              />
            </motion.div>
          )}

          {activeTab === "become-expert" && (
            <motion.div
              key="become-expert"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <BecomeExpertTab
                filter={filter}
                levelsData={levelsData}
                igData={igData}
                isLoading={levelsLoading || igLoading}
                error={levelsError || igError}
                isAuthenticated={isAuthenticated}
              />
            </motion.div>
          )}

          {activeTab === "events" && (
            <motion.div
              key="events"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <EventsTab />
            </motion.div>
          )}

          {activeTab === "tasks" && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <LearnerTasksPage />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
