"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MANAGE_EVENT_STATUS_PILLS } from "../constants/events.constants";
import type { EventStatus } from "../types";

interface ManageEventsFiltersProps {
  onSearch: (query: string) => void;
  searchValue: string;
  selectedStatus: EventStatus | "all";
  onStatusChange: (status: EventStatus | "all") => void;
}

export function ManageEventsFilters({
  onSearch,
  searchValue,
  selectedStatus,
  onStatusChange,
}: ManageEventsFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative w-full md:max-w-sm md:flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            placeholder="Search events"
            onChange={(e) => onSearch(e.target.value)}
            className="rounded-xl border-border bg-background pl-10 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-none">
        {MANAGE_EVENT_STATUS_PILLS.map((pill) => {
          const active = selectedStatus === pill.value;
          return (
            <Button
              key={pill.value}
              type="button"
              size="sm"
              variant="outline"
              className={`rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary ${
                active
                  ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  : ""
              }`}
              onClick={() => onStatusChange(pill.value)}
            >
              {pill.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
