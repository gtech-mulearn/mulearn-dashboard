"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ChevronDown,
  Filter,
  Search,
  User,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
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
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAchievements } from "@/features/achievements/api/achievements.api";
import { LearnerCard } from "@/features/company-jobs/components";
import { useLearnerDiscovery } from "@/features/company-jobs/hooks";
import type { LearnerDiscoveryParams } from "@/features/company-jobs/types";
import { getInterestGroupsList } from "@/features/interest-groups/api/interest-groups.api";
import { useDebounce } from "@/hooks/use-debounce";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const LEARNER_SKELETONS = ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8"];

function LearnerCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-1/2 rounded" />
          <Skeleton className="h-3 w-1/3 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-14 rounded-lg" />
        <Skeleton className="h-14 rounded-lg" />
      </div>
      <div className="flex gap-1">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-4 w-20 rounded-full" />
      </div>
    </div>
  );
}

// ─── Filters panel ───────────────────────────────────────────────────────────

interface ActiveFilters {
  min_karma?: number;
  max_karma?: number;
  level?: number;
  college?: string;
  department?: string;
  graduation_year?: string;
  ig?: string;
  skill?: string;
  achievement?: string;
  task?: string;
  sortBy?: string;
}

interface FiltersDropdownProps {
  filters: ActiveFilters;
  onChange: (f: ActiveFilters) => void;
}

function FiltersDropdown({ filters, onChange }: FiltersDropdownProps) {
  const activeCount = Object.values(filters).filter(Boolean).length;

  const { data: igResponse, isLoading: isLoadingIgs } = useQuery({
    queryKey: ["interest-groups-list"],
    queryFn: () => getInterestGroupsList(),
  });
  const interestGroups = igResponse?.response?.interestGroup || [];

  const { data: achievements = [], isLoading: isLoadingAchievements } =
    useQuery({
      queryKey: ["achievements-list"],
      queryFn: fetchAchievements,
    });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-9 text-sm">
          <Filter className="h-3.5 w-3.5" />
          Filters
          {activeCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeCount}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 max-h-[80vh] overflow-y-auto"
        onInteractOutside={(event) => {
          const target = event.target as HTMLElement;
          if (
            target &&
            (target.closest("[data-radix-select-content]") ||
              target.closest('[data-slot="select-content"]') ||
              target.closest('div[role="listbox"]') ||
              target.closest("[data-radix-portal]"))
          ) {
            event.preventDefault();
          }
        }}
      >
        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={filters.sortBy || "-karma"}
          onValueChange={(v) => onChange({ ...filters, sortBy: v })}
        >
          <DropdownMenuRadioItem value="-karma" className="text-xs">
            Karma (High to Low)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="karma" className="text-xs">
            Karma (Low to High)
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Karma Range</DropdownMenuLabel>
        <div className="flex gap-2 p-2">
          <Input
            placeholder="Min"
            value={filters.min_karma || ""}
            onChange={(e) =>
              onChange({
                ...filters,
                min_karma: e.target.value
                  ? parseInt(e.target.value, 10)
                  : undefined,
              })
            }
            className="h-8 text-xs"
          />
          <Input
            placeholder="Max"
            value={filters.max_karma || ""}
            onChange={(e) =>
              onChange({
                ...filters,
                max_karma: e.target.value
                  ? parseInt(e.target.value, 10)
                  : undefined,
              })
            }
            className="h-8 text-xs"
          />
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Min Level</DropdownMenuLabel>
        <div className="p-2">
          <Select
            value={filters.level ? String(filters.level) : "all"}
            onValueChange={(val) =>
              onChange({
                ...filters,
                level: val === "all" ? undefined : parseInt(val, 10),
              })
            }
          >
            <SelectTrigger className="w-full h-8 text-xs bg-transparent">
              <SelectValue placeholder="Min Level Order" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              className="w-60 z-50 max-h-60 overflow-y-auto"
            >
              <SelectItem value="all" className="text-xs">
                Any Level
              </SelectItem>
              <SelectItem value="1" className="text-xs">
                Level 1
              </SelectItem>
              <SelectItem value="2" className="text-xs">
                Level 2
              </SelectItem>
              <SelectItem value="3" className="text-xs">
                Level 3
              </SelectItem>
              <SelectItem value="4" className="text-xs">
                Level 4
              </SelectItem>
              <SelectItem value="5" className="text-xs">
                Level 5
              </SelectItem>
              <SelectItem value="6" className="text-xs">
                Level 6
              </SelectItem>
              <SelectItem value="7" className="text-xs">
                Level 7
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Interest Groups</DropdownMenuLabel>
        <div className="p-2">
          <Select
            value={filters.ig || "all"}
            onValueChange={(val) =>
              onChange({
                ...filters,
                ig: val === "all" ? undefined : val,
              })
            }
          >
            <SelectTrigger className="w-full h-8 text-xs bg-transparent">
              <SelectValue placeholder="Interest Group Name" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              className="w-60 z-50 max-h-60 overflow-y-auto"
            >
              {isLoadingIgs ? (
                <SelectItem value="loading" disabled className="text-xs">
                  Loading...
                </SelectItem>
              ) : interestGroups.length === 0 ? (
                <SelectItem value="empty" disabled className="text-xs">
                  No interest groups found
                </SelectItem>
              ) : (
                <>
                  <SelectItem value="all" className="text-xs">
                    Any Interest Group
                  </SelectItem>
                  {interestGroups.map((group) => (
                    <SelectItem
                      key={group.id}
                      value={group.name}
                      className="text-xs"
                    >
                      {group.name}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Achievements</DropdownMenuLabel>
        <div className="p-2">
          <Select
            value={filters.achievement || "all"}
            onValueChange={(val) =>
              onChange({
                ...filters,
                achievement: val === "all" ? undefined : val,
              })
            }
          >
            <SelectTrigger className="w-full h-8 text-xs bg-transparent">
              <SelectValue placeholder="Achievement UUID" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              className="w-60 z-50 max-h-60 overflow-y-auto"
            >
              {isLoadingAchievements ? (
                <SelectItem value="loading" disabled className="text-xs">
                  Loading...
                </SelectItem>
              ) : achievements.length === 0 ? (
                <SelectItem value="empty" disabled className="text-xs">
                  No achievements found
                </SelectItem>
              ) : (
                <>
                  <SelectItem value="all" className="text-xs">
                    Any Achievement
                  </SelectItem>
                  {achievements.map((achievement) => (
                    <SelectItem
                      key={achievement.id}
                      value={achievement.id}
                      className="text-xs"
                    >
                      {achievement.name}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function TalentPoolPageClient() {
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [filters, setFilters] = useState<ActiveFilters>({});
  const debouncedSearch = useDebounce(search, 300);

  const params: LearnerDiscoveryParams = {
    search: debouncedSearch || undefined,
    min_karma: filters.min_karma,
    max_karma: filters.max_karma,
    level: filters.level,
    college: filters.college,
    department: filters.department,
    graduation_year: filters.graduation_year,
    ig: filters.ig,
    skill: filters.skill,
    achievement: filters.achievement,
    task: filters.task,
    sort_by: filters.sortBy,
    page: pageIndex,
    per_page: 24,
  };

  const { data, isLoading, isError } = useLearnerDiscovery(params);
  const learners = data?.learners ?? [];
  const total = data?.pagination.count ?? 0;

  const clearFilters = () => {
    setSearch("");
    setFilters({});
    setPageIndex(1);
  };

  const hasActive = !!search || Object.values(filters).some(Boolean);

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Talent Pool
        </h1>
        <p className="text-sm text-muted-foreground">
          Discover learners by karma, level, and details.
        </p>
      </div>

      {/* Controls row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
        {/* Summary badge */}
        {!isLoading && !isError && (
          <div className="flex h-9 shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm">
            <Users className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">
              {total.toLocaleString()}
            </span>
            <span className="text-muted-foreground">learners found</span>
          </div>
        )}

        {/* Search */}
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            id="talent-search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageIndex(1);
            }}
            placeholder="Search by name or MUID…"
            className="h-9 pl-9 pr-8 text-sm w-full"
          />
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <FiltersDropdown
            filters={filters}
            onChange={(f) => {
              setFilters(f);
              setPageIndex(1);
            }}
          />
          {hasActive && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0"
              onClick={clearFilters}
            >
              <X className="h-3.5 w-3.5" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {LEARNER_SKELETONS.map((s) => (
            <LearnerCardSkeleton key={s} />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-border">
          <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-3 py-12">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <p className="text-sm text-muted-foreground">
              Failed to load learners. Please try again.
            </p>
          </CardContent>
        </Card>
      ) : learners.length === 0 ? (
        <Card className="border-dashed border-border">
          <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="rounded-full bg-muted p-4">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">No learners found</p>
              <p className="text-sm text-muted-foreground">
                {hasActive
                  ? "Try adjusting your filters."
                  : "No learners available yet."}
              </p>
            </div>
            {hasActive && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {learners.map((learner) => (
            <LearnerCard key={learner.id} learner={learner} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading &&
        !isError &&
        data?.pagination.totalPages &&
        data.pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
              disabled={pageIndex === 1}
              className="h-8 text-xs"
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {pageIndex} of {data.pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((p) => p + 1)}
              disabled={!data.pagination.isNext}
              className="h-8 text-xs"
            >
              Next
            </Button>
          </div>
        )}
    </div>
  );
}
