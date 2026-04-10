"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EVENT_CLUSTER_OPTIONS,
  EVENT_TYPE_OPTIONS,
} from "../constants/events.constants";
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

export function EventsFilters({
  onSearch,
  selectedCluster = "all",
  onClusterChange,
  selectedEventType = "all",
  onEventTypeChange,
}: EventsFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative w-full md:max-w-sm md:flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events"
            onChange={(e) => onSearch(e.target.value)}
            className="rounded-xl border-border bg-background pl-10 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-none">
        {EVENT_CLUSTER_OPTIONS.map((cluster) => {
          const active = selectedCluster === cluster.value;
          return (
            <Button
              key={cluster.value}
              type="button"
              size="sm"
              variant="outline"
              className={`rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary ${
                active
                  ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  : ""
              }`}
              onClick={() => onClusterChange?.(cluster.value)}
            >
              {cluster.label}
            </Button>
          );
        })}
      </div>

      <div className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-none">
        {EVENT_TYPE_OPTIONS.map((item) => {
          const active = selectedEventType === item.value;
          return (
            <Button
              key={item.value}
              type="button"
              size="sm"
              variant="outline"
              className={`rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary ${
                active
                  ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  : ""
              }`}
              onClick={() =>
                onEventTypeChange?.(item.value as EventType | "all")
              }
            >
              {item.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
