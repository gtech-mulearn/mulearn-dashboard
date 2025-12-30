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
  | "achievements";

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

const tabs: { id: ProfileTab; label: string }[] = [
  { id: "basic-details", label: "Basic Details" },
  { id: "karma-history", label: "Karma History" },
  { id: "mu-voyage", label: "Mu Voyage" },
  { id: "achievements", label: "Achievements" },
];

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="relative">
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-white text-[#0961F5] shadow-sm"
                : "text-gray-600 hover:bg-white/50 hover:text-gray-900",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
