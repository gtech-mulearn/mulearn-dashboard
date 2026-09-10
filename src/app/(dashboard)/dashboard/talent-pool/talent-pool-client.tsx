"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ChevronDown,
  Download,
  Filter,
  GraduationCap,
  Search,
  Star,
  User,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAchievements } from "@/features/achievements";
import { downloadTalentPoolInsightsCSV } from "@/features/company-jobs/api";
import { LearnerCard } from "@/features/company-jobs/components";
import {
  useLearnerDiscovery,
  useRemoveLearnerFromShortlist,
  useShortlistedLearners,
  useTalentPoolInsights,
} from "@/features/company-jobs/hooks";
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
  const [open, setOpen] = useState(false);
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
    <DropdownMenu open={open} onOpenChange={setOpen}>
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
          onValueChange={(v) => {
            onChange({ ...filters, sortBy: v });
            setOpen(false);
          }}
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
            onValueChange={(val) => {
              onChange({
                ...filters,
                level: val === "all" ? undefined : parseInt(val, 10),
              });
              setOpen(false);
            }}
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
            onValueChange={(val) => {
              onChange({
                ...filters,
                ig: val === "all" ? undefined : val,
              });
              setOpen(false);
            }}
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
            onValueChange={(val) => {
              onChange({
                ...filters,
                achievement: val === "all" ? undefined : val,
              });
              setOpen(false);
            }}
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

// ─── Shortlisted Tab ──────────────────────────────────────────────────────────

function ShortlistedTab() {
  const {
    data: shortlisted = [],
    isLoading,
    isError,
  } = useShortlistedLearners();
  const { mutateAsync: removeLearner, isPending: isRemoving } =
    useRemoveLearnerFromShortlist();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
          <div
            key={k}
            className="rounded-2xl border border-border bg-card p-5 space-y-3"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-1/2 rounded" />
                <Skeleton className="h-3 w-1/3 rounded" />
              </div>
            </div>
            <Skeleton className="h-14 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-border">
        <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-3 py-12">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground">
            Failed to load shortlisted learners. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (shortlisted.length === 0) {
    return (
      <Card className="border-dashed border-border">
        <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-3 py-12 text-center">
          <div className="rounded-full bg-muted p-4">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">
              No shortlisted learners
            </p>
            <p className="text-sm text-muted-foreground">
              Shortlist learners from the Discover tab to see them here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {shortlisted.map((learner) => {
        const initials = learner.full_name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

        return (
          <Card key={learner.id} className="flex flex-col p-3 py-4">
            {/* Avatar + name + remove button */}
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">
                  {learner.full_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Karma: {learner.karma.toLocaleString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Remove from shortlist"
                onClick={() => removeLearner(learner.id)}
                disabled={isRemoving}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Note */}
            {learner.shortlist_note && (
              <div className="mt-3 rounded-lg bg-muted/50 px-3 py-2">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
                  Note
                </p>
                <p className="text-xs text-foreground/80 italic line-clamp-3">
                  &ldquo;{learner.shortlist_note}&rdquo;
                </p>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── Insights Tab ─────────────────────────────────────────────────────────────

function InsightsTab() {
  const { data: insights, isLoading, isError } = useTalentPoolInsights();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadTalentPoolInsightsCSV();
    } catch (_error) {
      toast.error("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-[200px] rounded-xl" />
        <Skeleton className="h-[200px] rounded-xl" />
      </div>
    );
  }

  if (isError || !insights) {
    return (
      <Card className="border-border">
        <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-3 py-12">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground">
            Failed to load insights. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Talent Pool Overview
          </h2>
          <p className="text-sm text-muted-foreground">
            High-level metrics and top skills from the active learner pool.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <Skeleton className="h-4 w-4 rounded-full animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isExporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Learners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {insights.total_learners.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Top Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="h-4 w-4 text-primary" />
              Top Skills
            </CardTitle>
            <CardDescription>
              Most common skills across the pool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.top_skills.length === 0 ? (
                <p className="text-sm text-muted-foreground">No skills data.</p>
              ) : (
                insights.top_skills.map((skill) => (
                  <div key={skill.skill_id} className="flex items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {skill.skill_name}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {skill.learner_count.toLocaleString()}
                      </span>
                      learners
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Colleges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-4 w-4 text-primary" />
              Top Colleges
            </CardTitle>
            <CardDescription>
              Institutions with the most learners
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.top_colleges.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No college data.
                </p>
              ) : (
                insights.top_colleges.map((college) => (
                  <div key={college.college_id} className="flex items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {college.college_name}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {college.learner_count.toLocaleString()}
                      </span>
                      learners
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
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
    sort_by: filters.sortBy || "-karma",
    page: pageIndex,
    per_page: 24,
  };

  const { data, isLoading, isError } = useLearnerDiscovery(params);
  const learners = data?.learners ?? [];
  const total = data?.pagination.count ?? 0;

  // For the tab badge counter
  const { data: shortlisted = [] } = useShortlistedLearners();
  const shortlistCount = shortlisted.length;

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

      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="shortlisted" className="gap-1.5">
            Shortlisted
            {shortlistCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {shortlistCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* ── Discover tab ── */}
        <TabsContent value="discover" className="mt-0 space-y-6">
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
                  <p className="font-medium text-foreground">
                    No learners found
                  </p>
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
        </TabsContent>

        {/* ── Shortlisted tab ── */}
        <TabsContent value="shortlisted" className="mt-0">
          <ShortlistedTab />
        </TabsContent>

        {/* ── Insights tab ── */}
        <TabsContent value="insights" className="mt-0">
          <InsightsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
