/**
 * Journey Tabs Component
 *
 * 📍 src/features/mujourney/components/JourneyTabs.tsx
 *
 * Tab navigation for MuJourney
 */

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
}

interface JourneyTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
}

export function JourneyTabs({
  tabs,
  defaultTab,
  onTabChange,
}: JourneyTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className="flex gap-2 p-1.5 bg-card rounded-full w-fit shadow-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => handleTabChange(tab.id)}
          className={cn(
            "px-7 py-3 rounded-full font-semibold text-base transition-all cursor-pointer",
            activeTab === tab.id
              ? "bg-blue-600 text-white shadow-md"
              : "text-card-foreground hover:bg-muted",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
