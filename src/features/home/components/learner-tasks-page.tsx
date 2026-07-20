"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StateDisplay } from "@/components/ui/state-display";
import { LevelCard } from "@/features/mujourney/components/LevelCard";
import type { UserLevelData } from "@/features/mujourney/schemas";
import { usePublicTasks } from "@/features/tasks/hooks";
import type { PublicTaskListParams } from "@/features/tasks/types/tasks.types";
import { useDebounce } from "@/hooks/use-debounce";

// ─── Constants ─────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { label: "Default", value: "" },
  { label: "Karma: High → Low", value: "-karma" },
  { label: "Karma: Low → High", value: "karma" },
  { label: "Title A–Z", value: "title" },
  { label: "Title Z–A", value: "-title" },
  { label: "Newest First", value: "-created_at" },
  { label: "Oldest First", value: "created_at" },
  { label: "Most Used", value: "-usage_count" },
  { label: "Level", value: "level" },
];

const PER_PAGE_OPTIONS = [10, 20, 50];

// ─── Component ─────────────────────────────────────────────────────────

interface LearnerTasksPageProps {
  /** Externally controlled task source filter — set by the parent dropdown */
  taskSource?: PublicTaskListParams["task_source"] | "";
}

export function LearnerTasksPage({ taskSource = "" }: LearnerTasksPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  // Build params from all filter state
  const queryParams: PublicTaskListParams = {
    pageIndex: currentPage,
    perPage,
    search: debouncedSearch,
    sortBy,
    ...(taskSource ? { task_source: taskSource } : {}),
  };

  const { data, isLoading, isFetching } = usePublicTasks(queryParams);

  const tasks = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const totalCount = pagination?.count ?? 0;

  // ─── Handlers ──────────────────────────────────────────────────────

  const handleSearch = useCallback((val: string) => {
    setSearchInput(val);
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((val: string) => {
    setSortBy(val === "__none__" ? "" : val);
    setCurrentPage(1);
  }, []);

  const handlePerPage = useCallback((val: string) => {
    setPerPage(Number(val));
    setCurrentPage(1);
  }, []);

  const clearSearch = () => {
    setSearchInput("");
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setSortBy("");
    setCurrentPage(1);
  };

  const hasActiveFilters = !!searchInput || !!sortBy;

  // ─── Group tasks by level ───────────────────────────────────────────

  const groupedLevels = useMemo(() => {
    // biome-ignore lint/suspicious/noExplicitAny: Temporary fix
    const map = new Map<string, any[]>();

    tasks.forEach((task) => {
      // Extract numeric level, e.g. "lvl3" → "3", fallback to "1"
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

    // Sort numerically by level number
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
      {/* ── Row 1: Search ─────────────────────────────────────────── */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          id="task-search"
          placeholder="Search by title, hashtag, type, IG, channel, level..."
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9 pr-8 h-9 text-sm"
        />
        {searchInput && (
          <Button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>

      {/* ── Row 2: Filters ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Sort */}
        <Select value={sortBy || "__none__"} onValueChange={handleSort}>
          <SelectTrigger
            id="task-sort"
            className="h-9 text-sm w-[180px] shrink-0"
          >
            <SlidersHorizontal className="size-3.5 mr-1 text-muted-foreground shrink-0" />
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value || "__none__"}
                value={opt.value || "__none__"}
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Per page */}
        <Select value={String(perPage)} onValueChange={handlePerPage}>
          <SelectTrigger
            id="task-per-page"
            className="h-9 text-sm w-[80px] shrink-0"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PER_PAGE_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear all filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
            Clear filters
          </Button>
        )}
      </div>

      {/* ── Stats row ──────────────────────────────────────────────── */}
      {!isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {totalCount > 0 ? (
              <>
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {Math.min((currentPage - 1) * perPage + 1, totalCount)}–
                  {Math.min(currentPage * perPage, totalCount)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {totalCount}
                </span>{" "}
                tasks
              </>
            ) : (
              "No tasks found"
            )}
          </span>
          {isFetching && !isLoading && (
            <span className="text-xs text-primary animate-pulse">
              Updating...
            </span>
          )}
        </div>
      )}

      {/* ── Content ────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        </div>
      ) : groupedLevels.length === 0 ? (
        hasActiveFilters ? (
          <StateDisplay
            variant="no-results"
            description={
              searchInput
                ? `No tasks match "${searchInput}". Try a different path and keep exploring.`
                : undefined
            }
            action={
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Clear all filters
              </Button>
            }
          />
        ) : (
          <StateDisplay
            variant="no-tasks"
            title="No tasks available"
            description="You have no tasks assigned at the moment. New community tasks will appear here as they become available."
          />
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
