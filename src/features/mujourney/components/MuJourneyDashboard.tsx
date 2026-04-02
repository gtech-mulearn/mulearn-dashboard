"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Filter } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ];

  // Calculate stats - if we have data (public or private), use it.
  const levels = levelsData?.response || [];
  const totalKarma = levels.reduce((sum, level) => sum + (level.karma || 0), 0);

  // Calculate current level
  const currentLevel =
    levels.length > 0
      ? parseInt(levels[levels.length - 1].name.match(/\d+/)?.[0] || "1", 10)
      : undefined;

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <JourneyHeader
          title="MuJourney"
          subtitle="Your Learning Path - Complete tasks, earn karma, level up"
          currentLevel={currentLevel}
          totalKarma={totalKarma}
          showProgress={isAuthenticated && !!currentLevel}
        />
      </motion.div>

      {/* Tab Navigation & Filter */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="w-full lg:w-auto overflow-x-hidden">
          <JourneyTabs
            tabs={tabs}
            defaultTab="start-learning"
            onTabChange={setActiveTab}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 bg-card/40 backdrop-blur-md p-2 rounded-2xl border border-border shadow-xs">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Filter className="h-4 w-4 text-primary" />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-transparent border-none focus:ring-0 font-semibold uppercase tracking-widest text-[10px] sm:text-xs">
              <SelectValue placeholder="All Tasks" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border">
              <SelectItem value="all" className="font-medium">
                ALL TASKS
              </SelectItem>
              <SelectItem value="completed" className="font-medium">
                COMPLETED
              </SelectItem>
              <SelectItem value="incomplete" className="font-medium">
                INCOMPLETE
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
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
        </AnimatePresence>
      </div>
    </div>
  );
}
