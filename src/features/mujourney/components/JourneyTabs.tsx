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
    <div className="flex gap-1 sm:gap-2 p-1.5 bg-card rounded-full w-fit max-w-full overflow-x-auto shadow-lg no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => handleTabChange(tab.id)}
          className={cn(
            "px-4 sm:px-7 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base whitespace-nowrap transition-all cursor-pointer shrink-0",
            activeTab === tab.id
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-card-foreground hover:bg-muted",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
