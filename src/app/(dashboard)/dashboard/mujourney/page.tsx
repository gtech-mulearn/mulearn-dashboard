/**
 * MuJourney Main Page
 *
 * 📍 src/app/(dashboard)/mujourney/page.tsx
 *
 * Main MuJourney interface with tabs
 */

"use client";

import { useState } from "react";
import {
  JourneyHeader,
  JourneyTabs,
  StartLearningTab,
  BecomeExpertTab,
  EventsTab,
} from "@/features/mujourney";
import { useUserLevels } from "@/features/mujourney/hooks";
import { authStore } from "@/lib/auth";

export default function MuJourneyPage() {
  const [activeTab, setActiveTab] = useState("start-learning");
  const [filter, setFilter] = useState("all");
  const isAuthenticated = !!authStore.getAccessToken();

  const { data: userLevelsData } = useUserLevels();

  const tabs = [
    { id: "start-learning", label: "Start Journey" },
    { id: "become-expert", label: "Become Expert" },
    { id: "events", label: "Events" },
  ];

  // Calculate current level and total karma from response array
  const levels = userLevelsData?.response || [];
  const totalKarma = levels.reduce((sum, level) => sum + (level.karma || 0), 0);
  const currentLevel =
    levels.length > 0
      ? parseInt(levels[levels.length - 1].name.match(/\d+/)?.[0] || "1", 10)
      : undefined;

  return (
    <div className="space-y-8">
      {/* Header */}
      <JourneyHeader
        title="MuJourney"
        subtitle="Your Learning Path - Complete tasks, earn karma, level up"
        currentLevel={currentLevel}
        totalKarma={totalKarma}
        showProgress={isAuthenticated && !!currentLevel}
      />

      {/* Tab Navigation */}
      <div className="flex items-center justify-between">
        <JourneyTabs
          tabs={tabs}
          defaultTab="start-learning"
          onTabChange={setActiveTab}
        />

        <div className="flex items-center gap-3">
          <span className="text-base font-medium text-foreground">
            Filter by:
          </span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-5 py-2.5 border border-border rounded-lg bg-card text-base font-medium text-card-foreground cursor-pointer hover:border-ring transition-colors [&>option]:cursor-pointer"
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
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === "start-learning" && <StartLearningTab filter={filter} />}
        {activeTab === "become-expert" && <BecomeExpertTab filter={filter} />}
        {activeTab === "events" && <EventsTab />}
      </div>
    </div>
  );
}
