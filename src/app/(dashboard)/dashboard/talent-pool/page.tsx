"use client";

import {
  AlertTriangle,
  Briefcase,
  CheckCircle,
  ChevronDown,
  Filter,
  Search,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { LearnerCard } from "@/features/company-jobs/components";
import { useLearnerDiscovery } from "@/features/company-jobs/hooks";
import type { LearnerDiscoveryParams } from "@/features/company-jobs/types";
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
  interested_in_work?: boolean;
  interested_in_gig_work?: boolean;
  karma_min?: number;
  karma_max?: number;
  level_order_min?: number;
  ig_ids?: string;
  achievement_ids?: string;
  sortBy?: string;
}

interface FiltersDropdownProps {
  filters: ActiveFilters;
  onChange: (f: ActiveFilters) => void;
}

function FiltersDropdown({ filters, onChange }: FiltersDropdownProps) {
  const activeCount = Object.values(filters).filter(Boolean).length;

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
      >
        <DropdownMenuLabel>Work Intent</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={!!filters.interested_in_work}
          onCheckedChange={(v) =>
            onChange({ ...filters, interested_in_work: v || undefined })
          }
        >
          <Briefcase className="h-3.5 w-3.5 mr-2" />
          Open to Full-time
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={!!filters.interested_in_gig_work}
          onCheckedChange={(v) =>
            onChange({ ...filters, interested_in_gig_work: v || undefined })
          }
        >
          <Sparkles className="h-3.5 w-3.5 mr-2" />
          Open to Gig Work
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />
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
            value={filters.karma_min || ""}
            onChange={(e) =>
              onChange({
                ...filters,
                karma_min: e.target.value
                  ? parseInt(e.target.value, 10)
                  : undefined,
              })
            }
            className="h-8 text-xs"
          />
          <Input
            placeholder="Max"
            value={filters.karma_max || ""}
            onChange={(e) =>
              onChange({
                ...filters,
                karma_max: e.target.value
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
          <Input
            placeholder="Min Level Order"
            value={filters.level_order_min || ""}
            onChange={(e) =>
              onChange({
                ...filters,
                level_order_min: e.target.value
                  ? parseInt(e.target.value, 10)
                  : undefined,
              })
            }
            className="h-8 text-xs"
          />
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Interest Groups</DropdownMenuLabel>
        <div className="p-2">
          <Input
            placeholder="UUID1,UUID2..."
            value={filters.ig_ids || ""}
            onChange={(e) =>
              onChange({ ...filters, ig_ids: e.target.value || undefined })
            }
            className="h-8 text-xs"
          />
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Achievements</DropdownMenuLabel>
        <div className="p-2">
          <Input
            placeholder="UUID1,UUID2..."
            value={filters.achievement_ids || ""}
            onChange={(e) =>
              onChange({
                ...filters,
                achievement_ids: e.target.value || undefined,
              })
            }
            className="h-8 text-xs"
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TalentPoolPage() {
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [filters, setFilters] = useState<ActiveFilters>({});
  const debouncedSearch = useDebounce(search, 300);

  const params: LearnerDiscoveryParams = {
    search: debouncedSearch || undefined,
    interested_in_work: filters.interested_in_work,
    interested_in_gig_work: filters.interested_in_gig_work,
    karma_min: filters.karma_min,
    karma_max: filters.karma_max,
    level_order_min: filters.level_order_min,
    ig_ids: filters.ig_ids,
    achievement_ids: filters.achievement_ids,
    sortBy: filters.sortBy,
    pageIndex: pageIndex,
    perPage: 24,
  };

  const { data, isLoading, isError } = useLearnerDiscovery(params);
  const learners = data?.learners ?? [];
  const total = data?.pagination.count ?? 0;

  const clearFilters = () => {
    setSearch("");
    setFilters({});
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
          Discover learners by karma, level, and work intent.
        </p>
      </div>

      {/* Summary strip */}
      {!isLoading && !isError && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm">
            <Users className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">
              {total.toLocaleString()}
            </span>
            <span className="text-muted-foreground">learners found</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span className="font-semibold text-foreground">
              {learners.filter((l) => l.interested_in_work).length}
            </span>
            <span className="text-muted-foreground">open to work</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="font-semibold text-foreground">
              {learners.filter((l) => l.interested_in_gig_work).length}
            </span>
            <span className="text-muted-foreground">open to gigs</span>
          </div>
        </div>
      )}

      {/* Controls row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            id="talent-search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageIndex(1);
            }}
            placeholder="Search by name or MUID…"
            className="h-9 pl-9 pr-8 text-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
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
            className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={clearFilters}
          >
            <X className="h-3.5 w-3.5" />
            Clear all
          </Button>
        )}
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
