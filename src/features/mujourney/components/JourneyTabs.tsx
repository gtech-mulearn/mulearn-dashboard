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
    <div className="relative max-w-full">
      <div className="flex gap-1 sm:gap-2 p-1.5 bg-card rounded-full w-full sm:w-fit max-w-full overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "px-5 sm:px-7 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base whitespace-nowrap transition-all cursor-pointer shrink-0",
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-md"
                : "text-card-foreground hover:bg-muted",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Scroll Fade Hint for Mobile */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background/40 to-transparent pointer-events-none rounded-r-full sm:hidden" />
    </div>
  );
}
