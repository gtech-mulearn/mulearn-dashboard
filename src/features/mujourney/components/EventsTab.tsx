"use client";

/**
 * Events Tab Component
 *
 * 📍 src/features/mujourney/components/EventsTab.tsx
 *
 * Shows event-based tasks — pre-filtered to is_event_task=true
 */

import { Calendar, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StateDisplay } from "@/components/ui/state-display";
import { LevelCard } from "@/features/mujourney/components/LevelCard";
import type { Task, UserLevelData } from "@/features/mujourney/schemas";
import { usePublicTasks } from "@/features/tasks/hooks";
import type { PublicTaskListParams } from "@/features/tasks/types/tasks.types";
import { useDebounce } from "@/hooks/use-debounce";

// ─── Component ─────────────────────────────────────────────────────────

export function EventsTab() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");

  const debouncedSearch = useDebounce(searchInput, 400);

  // Always filter to event tasks only
  const queryParams: PublicTaskListParams = {
    pageIndex: currentPage,
    perPage: 20,
    search: debouncedSearch,
    is_event_task: true,
  };

  const { data, isLoading } = usePublicTasks(queryParams);

  const tasks = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  const clearSearch = () => {
    setSearchInput("");
    setCurrentPage(1);
  };

  const handleSearch = (val: string) => {
    setSearchInput(val);
    setCurrentPage(1);
  };

  // ─── Group tasks by level ───────────────────────────────────────────

  const groupedLevels = useMemo(() => {
    const map = new Map<string, Task[]>();

    tasks.forEach((task) => {
      const levelNumber = task.level?.match(/\d+/)?.[0] ?? "1";
      const levelKey = `Lvl ${levelNumber}`;

      if (!map.has(levelKey)) {
        map.set(levelKey, []);
      }

      map.get(levelKey)?.push({
        task_id: task.id,
        task_name: task.title,
        task_description: task.description ?? "",
        karma: task.karma,
        hashtag: task.hashtag,
        completed: false,
        active: task.active,
        discord_link: task.discord_link,
        interest_group: task.ig ? { name: task.ig } : undefined,
        submission_channel: task.channel ? { name: task.channel } : undefined,
      });
    });

    const levels: UserLevelData[] = Array.from(map.entries()).map(
      ([name, levelTasks]) => ({
        name,
        karma: 0,
        tasks: levelTasks,
      }),
    );

    levels.sort((a, b) => {
      const numA = parseInt(a.name.match(/\d+/)?.[0] ?? "0", 10);
      const numB = parseInt(b.name.match(/\d+/)?.[0] ?? "0", 10);
      return numA - numB;
    });

    return levels;
  }, [tasks]);

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="size-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Event Tasks</h2>
      </div>

      {/* ── Search ─────────────────────────────────────────────────── */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          id="event-task-search"
          placeholder="Search by title, hashtag, type, IG, channel, level..."
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
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

      {/* ── Content ────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Loading event tasks...</p>
          </div>
        </div>
      ) : groupedLevels.length === 0 ? (
        searchInput ? (
          <StateDisplay
            variant="no-results"
            description={`No event tasks match "${searchInput}". Try a different path and keep exploring.`}
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
            <LevelCard key={level.name} level={level} isLocked={false} />
          ))}
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Page{" "}
            <span className="font-semibold text-foreground">{currentPage}</span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">{totalPages}</span>
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
