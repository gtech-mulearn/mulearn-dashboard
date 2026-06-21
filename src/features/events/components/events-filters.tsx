"use client";

import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EVENT_TYPE_OPTIONS } from "../constants/events.constants";
import type { EventType } from "../types";

interface ClusterOption {
  label: string;
  value: string;
}

interface EventTypeOption {
  label: string;
  value: string;
}

// Color configuration for each cluster badge
const CLUSTER_BADGE_STYLES: Record<string, string> = {
  all: "bg-primary/10 text-primary border-primary/20",
  coder: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  creative:
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  maker:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  manager:
    "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
};

const CLUSTER_DOT_STYLES: Record<string, string> = {
  all: "bg-primary",
  coder: "bg-blue-500",
  creative: "bg-purple-500",
  maker: "bg-emerald-500",
  manager: "bg-orange-500",
};

function getClusterBadgeStyle(value: string): string {
  return (
    CLUSTER_BADGE_STYLES[value.toLowerCase()] ||
    "bg-muted text-muted-foreground border-border"
  );
}

function getClusterDotStyle(value: string): string {
  return CLUSTER_DOT_STYLES[value.toLowerCase()] || "bg-muted-foreground";
}

interface EventsFiltersProps {
  onSearch: (query: string) => void;
  selectedCluster: string;
  onClusterChange?: (cluster: string) => void;
  selectedEventType?: string;
  onEventTypeChange?: (eventType: string) => void;
  clusters: ClusterOption[];
  isLoadingClusters?: boolean;
  eventTypes?: EventTypeOption[];
  isLoadingEventTypes?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onCategoryChange?: (category: string) => void;
  selectedCategory?: string;
}

export function EventsFilters({
  onSearch,
  selectedCluster,
  onClusterChange,
  selectedEventType = "all",
  onEventTypeChange,
  clusters,
  isLoadingClusters = false,
  eventTypes = [],
  isLoadingEventTypes = false,
}: EventsFiltersProps) {
  const selectedClusterOption =
    clusters.find((c) => c.value === selectedCluster) ?? clusters[0];

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Search input — Left side */}
      <div className="relative w-full md:max-w-xs md:flex-shrink-0 group">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary transition-colors group-focus-within:text-primary" />
        <Input
          placeholder="Search events..."
          onChange={(e) => onSearch(e.target.value)}
          className="h-12 rounded-lg border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 pl-12 pr-4 text-foreground font-medium placeholder:text-primary/60 shadow-lg shadow-primary/20 transition-all duration-300 focus:border-primary focus:shadow-xl focus:shadow-primary/40 hover:border-primary/50 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/15"
        />
      </div>

      {/* Dropdowns section — Right side */}
      <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center">
        {/* Cluster DropdownMenu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              id="cluster-filter-trigger"
              className={cn(
                "w-full md:w-48 h-10 rounded-full justify-between font-medium border-2 transition-all duration-200",
                "hover:shadow-md",
                getClusterBadgeStyle(selectedCluster),
              )}
            >
              <span className="flex items-center gap-2">
                {isLoadingClusters ? (
                  <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                ) : (
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full shrink-0",
                      getClusterDotStyle(selectedCluster),
                    )}
                  />
                )}
                <span className="truncate">
                  {selectedClusterOption?.label ?? "All"}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-48 p-1"
            id="cluster-filter-menu"
          >
            {isLoadingClusters ? (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading clusters…
              </div>
            ) : (
              clusters.map((cluster) => {
                const isSelected = selectedCluster === cluster.value;
                return (
                  <DropdownMenuItem
                    key={cluster.value}
                    id={`cluster-option-${cluster.value}`}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer transition-colors",
                      isSelected && "font-semibold",
                    )}
                    onSelect={() => onClusterChange?.(cluster.value)}
                  >
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        getClusterDotStyle(cluster.value),
                      )}
                    />
                    <span className="flex-1">{cluster.label}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </DropdownMenuItem>
                );
              })
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Event type dropdown */}
        <Select value={selectedEventType} onValueChange={onEventTypeChange}>
          <SelectTrigger
            className="w-full md:w-48 rounded-full"
            id="event-type-filter"
          >
            <SelectValue placeholder={isLoadingEventTypes ? "Loading..." : "Select event type"} />
          </SelectTrigger>
          <SelectContent>
            {isLoadingEventTypes ? (
              <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading types...
              </div>
            ) : (
              eventTypes.map(
                (item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ),
              )
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
