"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EventType, IGCluster } from "../types";

interface EventsFiltersProps {
  onSearch: (query: string) => void;
  selectedCluster?: IGCluster | "all";
  onClusterChange?: (cluster: IGCluster | "all") => void;
  selectedEventType?: EventType | "all";
  onEventTypeChange?: (eventType: EventType | "all") => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onCategoryChange?: (category: string) => void;
  selectedCategory?: string;
}

const clusters: Array<{ label: string; value: IGCluster | "all" }> = [
  { label: "All", value: "all" },
  { label: "Coder", value: "coder" },
  { label: "Maker", value: "maker" },
  { label: "Manager", value: "manager" },
  { label: "Creative", value: "creative" },
];

const eventTypes: Array<{ label: string; value: EventType | "all" }> = [
  { label: "All Types", value: "all" },
  { label: "Workshop", value: "workshop" },
  { label: "Webinar", value: "webinar" },
  { label: "Hackathon", value: "hackathon" },
  { label: "Meetup", value: "meetup" },
  { label: "Competition", value: "competition" },
  { label: "Social Gathering", value: "social_gathering" },
  { label: "Other", value: "other" },
];

export function EventsFilters({
  onSearch,
  selectedCluster = "all",
  onClusterChange,
  selectedEventType = "all",
  onEventTypeChange,
}: EventsFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search events"
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={selectedEventType}
          onChange={(e) =>
            onEventTypeChange?.(e.target.value as EventType | "all")
          }
        >
          {eventTypes.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {clusters.map((cluster) => {
          const active = selectedCluster === cluster.value;
          return (
            <Button
              key={cluster.value}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              className={
                active ? "bg-pink-600 hover:bg-pink-700 text-white" : ""
              }
              onClick={() => onClusterChange?.(cluster.value)}
            >
              {cluster.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
