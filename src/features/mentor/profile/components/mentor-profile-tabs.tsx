/**
 * Mentor Profile Tabs
 *
 * 📍 src/features/mentor/profile/components/mentor-profile-tabs.tsx
 *
 * Tab navigation for the mentor profile main area.
 */

"use client";

import { cn } from "@/lib/utils";

export type MentorProfileTab =
  | "about"
  | "scopes"
  | "sessions"
  | "availability"
  | "mentees"
  | "activity";

import { Button } from "@/components/ui/button";

interface MentorProfileTabsProps {
  activeTab: MentorProfileTab;
  onTabChange: (tab: MentorProfileTab) => void;
}

const TABS: { id: MentorProfileTab; label: string }[] = [
  { id: "about", label: "About" },
  { id: "scopes", label: "Scopes" },
  { id: "sessions", label: "Sessions" },
  { id: "availability", label: "Availability" },
  { id: "mentees", label: "Mentees" },
  { id: "activity", label: "Activity" },
];

export function MentorProfileTabs({
  activeTab,
  onTabChange,
}: MentorProfileTabsProps) {
  return (
    <div className="relative">
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-muted p-1 scrollbar-none">
        {TABS.map((tab) => (
          <Button
            key={tab.id}
            variant="secondary"
            type="button"
            onClick={() => onTabChange(tab.id)}
            aria-label={`${tab.label} tab`}
            aria-selected={activeTab === tab.id}
            className={cn(
              "relative whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:bg-card/50 hover:text-foreground",
            )}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
