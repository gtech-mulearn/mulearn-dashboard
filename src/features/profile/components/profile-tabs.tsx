/**
 * Profile Tabs Component
 *
 * 📍 src/features/profile/components/profile-tabs.tsx
 *
 * Tab navigation for profile sections.
 */

"use client";

import { cn } from "@/lib/utils";

export type ProfileTab =
  | "basic-details"
  | "karma-history"
  | "mu-voyage"
  | "achievements"
  | "badges"
  | "projects";

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

const tabs: { id: ProfileTab; label: string }[] = [
  { id: "basic-details", label: "Basic Details" },
  { id: "karma-history", label: "Karma History" },
  { id: "mu-voyage", label: "Mu Voyage" },
  { id: "achievements", label: "Achievements" },
  { id: "badges", label: "Badges" },
  { id: "projects", label: "Projects" },
];

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="relative">
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:bg-card/50 hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
