"use client";

/**
 * Start Learning Tab Component
 *
 * 📍 src/features/mujourney/components/StartLearningTab.tsx
 *
 * Displays foundational tasks from the start_journey section of the task list API.
 * Tasks are already API-filtered (no IG tasks, no event tasks, no intern tasks).
 * Client groups them by level.name for LevelCard display.
 * Includes client-side search filtering.
 */

import { Loader2, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StateDisplay } from "@/components/ui/state-display";
import { useDebounce } from "@/hooks/use-debounce";
import type { TaskListPublic } from "../schemas";
import { LevelCard } from "./LevelCard";

interface StartLearningTabProps {
  filter?: string;
  tasks?: TaskListPublic[];
  isLoading?: boolean;
  isFetching?: boolean;
  error?: Error | null;
}

export function StartLearningTab({
  filter = "all",
  tasks = [],
  isLoading,
  isFetching,
  error,
}: StartLearningTabProps) {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  // ── Client-side search filtering ──────────────────────────────────
  const filteredTasks = useMemo(() => {
    const byCompletion = tasks.filter((task) => {
      if (filter === "completed") return task.completed;
      if (filter === "incomplete") return !task.completed;
      return true;
    });

    if (!debouncedSearch) return byCompletion;
    const q = debouncedSearch.toLowerCase();
    return byCompletion.filter(
      (task) =>
        task.title.toLowerCase().includes(q) ||
        task.hashtag?.toLowerCase().includes(q) ||
        task.type?.toLowerCase().includes(q) ||
        task.ig?.toLowerCase().includes(q) ||
        task.channel?.toLowerCase().includes(q) ||
        task.level?.toLowerCase().includes(q),
    );
  }, [tasks, filter, debouncedSearch]);

  // Group tasks by level.name (e.g. "Explorer", "Intermediate") preserving API order.
  // API already orders by level.level_order then title.
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading your journey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <p className="text-destructive">Failed to load tasks</p>
          {process.env.NODE_ENV === "development" && (
            <p className="text-sm text-muted-foreground">{error.message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Search — always visible, even when no tasks */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          id="start-learning-search"
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

      {/* Background-refetch spinner */}
      {isFetching && !isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Refreshing tasks...
        </div>
      )}

      {/* Empty states */}
      {groupedLevels.length === 0 &&
        (searchInput ? (
          <StateDisplay
            variant="no-results"
            description={`No start journey tasks match "${searchInput}". Try a different search.`}
            action={
              <Button variant="outline" size="sm" onClick={clearSearch}>
                Clear search
              </Button>
            }
          />
        ) : filter !== "all" ? (
          <StateDisplay variant="no-results" />
        ) : (
          <StateDisplay variant="no-tasks" />
        ))}

      {/* Task levels */}
      {groupedLevels.map((level) => (
        <LevelCard
          key={level.name}
          name={level.name}
          tasks={level.tasks}
          isLocked={false}
        />
      ))}
    </div>
  );
}
