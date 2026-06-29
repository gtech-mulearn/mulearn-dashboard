"use client";

import { Check, ChevronDown, Loader2 } from "lucide-react";
import { SearchBar } from "@/components/dashboard/table/SearchBar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  coder: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  creative: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  maker: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  manager: "bg-chart-4/10 text-chart-4 border-chart-4/20",
};

const CLUSTER_DOT_STYLES: Record<string, string> = {
  all: "bg-primary",
  coder: "bg-chart-2",
  creative: "bg-chart-1",
  maker: "bg-chart-3",
  manager: "bg-chart-4",
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
      <SearchBar
        onSearch={onSearch}
        placeholder="Search events..."
        size="md"
        showButton={false}
        className="w-full md:max-w-xs md:flex-shrink-0"
      />

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
            <SelectValue
              placeholder={
                isLoadingEventTypes ? "Loading..." : "Select event type"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {isLoadingEventTypes ? (
              <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading types...
              </div>
            ) : (
              eventTypes.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
