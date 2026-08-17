"use client";

/**
 * Events Tab Component
 *
 * 📍 src/features/mujourney/components/EventsTab.tsx
 *
 * Displays event-linked tasks from the events section of the task list API.
 * No pagination (API returns full list). Client-side search + level grouping.
 */

import { Calendar, Loader2, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StateDisplay } from "@/components/ui/state-display";
import { useDebounce } from "@/hooks/use-debounce";
import type { TaskListPublic } from "../schemas";
import { LevelCard } from "./LevelCard";

interface EventsTabProps {
  tasks?: TaskListPublic[];
  isLoading?: boolean;
  isFetching?: boolean;
  error?: Error | null;
}

export function EventsTab({
  tasks = [],
  isLoading,
  isFetching,
  error,
}: EventsTabProps) {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  // ── Client-side search filtering ──────────────────────────────────────────
  const filteredTasks = useMemo(() => {
    if (!debouncedSearch) return tasks;
    const q = debouncedSearch.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(q) ||
        task.hashtag?.toLowerCase().includes(q) ||
        task.type?.toLowerCase().includes(q) ||
        task.ig?.toLowerCase().includes(q) ||
        task.channel?.toLowerCase().includes(q) ||
        task.level?.toLowerCase().includes(q) ||
        task.event?.toLowerCase().includes(q),
    );
  }, [tasks, debouncedSearch]);

  // ── Group by level.name for LevelCard display ─────────────────────────────
  // API orders by event_fk__title then title; group preserves that order.
  const groupedLevels = useMemo(() => {
    const map = new Map<string, TaskListPublic[]>();
    filteredTasks.forEach((task) => {
      const key = task.level ?? "General";
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(task);
    });
    return Array.from(map.entries()).map(([name, levelTasks]) => ({
      name,
      tasks: levelTasks,
    }));
  }, [filteredTasks]);

  const clearSearch = () => setSearchInput("");

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <Calendar className="size-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Event Tasks</h2>
        </div>
        {isFetching && !isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* ── Search ────────────────────────────────────────────────────── */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          id="event-task-search"
          placeholder="Search by title, hashtag, type, IG, channel, level..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9 pr-8 h-9 text-sm"
        />
        {searchInput && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* ── Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Loading event tasks...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-destructive">Failed to load event tasks</p>
        </div>
      ) : groupedLevels.length === 0 ? (
        searchInput ? (
          <StateDisplay
            variant="no-results"
            description={`No event tasks match "${searchInput}". Try a different search.`}
            action={
              <Button variant="outline" size="sm" onClick={clearSearch}>
                Clear search
              </Button>
            }
          />
        ) : (
          <StateDisplay variant="no-tasks" />
        )
      ) : (
        <div className="space-y-10">
          {groupedLevels.map((level) => (
            <LevelCard
              key={level.name}
              name={level.name}
              tasks={level.tasks}
              isLocked={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
