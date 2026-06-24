"use client";

import {
  AlertTriangle,
  ArrowDownUp,
  Briefcase,
  FileText,
  Filter,
  Search,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ApplicationRow,
  JobDetailModal,
  PublicJobCard,
} from "@/features/company-jobs/components";
import {
  useLearnerApplications,
  usePublicJobs,
} from "@/features/company-jobs/hooks";
import type { PublicJob } from "@/features/company-jobs/types";
import { useDebounce } from "@/hooks/use-debounce";

// ─── Skeleton helpers ─────────────────────────────────────────────────────────

function JobCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <Skeleton className="h-5 w-3/4 rounded" />
      <Skeleton className="h-3 w-1/2 rounded" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="flex justify-between pt-2 border-t border-border">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-7 w-16 rounded-lg" />
      </div>
    </div>
  );
}

function ApplicationSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-2/3 rounded" />
        <Skeleton className="h-3 w-1/3 rounded" />
      </div>
      <Skeleton className="h-6 w-24 rounded-full" />
    </div>
  );
}

const JOB_SKELETONS = [
  "job-s1",
  "job-s2",
  "job-s3",
  "job-s4",
  "job-s5",
  "job-s6",
];
const APP_SKELETONS = ["app-s1", "app-s2", "app-s3", "app-s4", "app-s5"];

// ─── Page ─────────────────────────────────────────────────────────────────────

// ─── Sort option definitions ──────────────────────────────────────────────────

const JOB_SORT_OPTIONS = [
  { value: "-created_at", label: "Newest First" },
  { value: "created_at", label: "Oldest First" },
  { value: "title", label: "Title (A → Z)" },
  { value: "-title", label: "Title (Z → A)" },
] as const;

const APP_SORT_OPTIONS = [
  { value: "-appliedAt", label: "Newest First" },
  { value: "appliedAt", label: "Oldest First" },
] as const;

export function LearnerJobsPageClient() {
  const [tab, setTab] = useState<"browse" | "applications">("browse");
  const [search, setSearch] = useState("");
  const [jobPageIndex, setJobPageIndex] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [jobSortBy, setJobSortBy] = useState<string>("-created_at");
  const [appSortBy, setAppSortBy] = useState<string>("-appliedAt");
  const [selectedJob, setSelectedJob] = useState<PublicJob | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const {
    data: publicJobsData,
    isLoading: loadingJobs,
    isError: jobsError,
  } = usePublicJobs({
    search: debouncedSearch || undefined,
    perPage: 21,
    pageIndex: jobPageIndex,
    sortBy: jobSortBy,
  });

  const {
    data: applicationsData,
    isLoading: loadingApplications,
    isError: applicationsError,
  } = useLearnerApplications({
    search: debouncedSearch || undefined,
    perPage: 30,
    sortBy: appSortBy,
    pageIndex: pageIndex,
  });

  const jobs = publicJobsData?.jobs ?? [];
  const applications = applicationsData?.applications ?? [];

  const handleSearchClear = useCallback(() => setSearch(""), []);

  return (
    <div className="space-y-6 p-1">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Jobs
        </h1>
        <p className="text-sm text-muted-foreground">
          Discover opportunities that match your skills and karma level.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-9 w-fit">
            <TabsTrigger value="browse" className="gap-2 text-xs">
              <Briefcase className="h-3.5 w-3.5" />
              Browse Jobs
              {publicJobsData?.pagination.count ? (
                <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  {publicJobsData.pagination.count}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="applications" className="gap-2 text-xs">
              <FileText className="h-3.5 w-3.5" />
              My Applications
              {applicationsData?.pagination.count ? (
                <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  {applicationsData.pagination.count}
                </span>
              ) : null}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {/* Sort Dropdown — Browse Jobs */}
            {tab === "browse" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="default"
                    id="browse-jobs-sort-trigger"
                    className="gap-2 text-sm"
                  >
                    <ArrowDownUp className="h-3.5 w-3.5" />
                    Sort
                    <span className="ml-1 hidden rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary sm:inline">
                      {JOB_SORT_OPTIONS.find((o) => o.value === jobSortBy)
                        ?.label ?? ""}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[160px]">
                  <DropdownMenuRadioGroup
                    value={jobSortBy}
                    onValueChange={(v) => {
                      setJobSortBy(v);
                      setJobPageIndex(1);
                    }}
                  >
                    {JOB_SORT_OPTIONS.map((opt) => (
                      <DropdownMenuRadioItem
                        key={opt.value}
                        value={opt.value}
                        className="text-xs"
                      >
                        {opt.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Sort Dropdown — My Applications */}
            {tab === "applications" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="default"
                    id="applications-sort-trigger"
                    className="gap-2 text-sm"
                  >
                    <ArrowDownUp className="h-3.5 w-3.5" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[140px]">
                  <DropdownMenuRadioGroup
                    value={appSortBy}
                    onValueChange={(v) => {
                      setAppSortBy(v);
                      setPageIndex(1);
                    }}
                  >
                    {APP_SORT_OPTIONS.map((opt) => (
                      <DropdownMenuRadioItem
                        key={opt.value}
                        value={opt.value}
                        className="text-xs"
                      >
                        {opt.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Search bar */}
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                id="jobs-search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setJobPageIndex(1);
                  setPageIndex(1);
                }}
                placeholder={
                  tab === "browse" ? "Search jobs…" : "Search applications…"
                }
                className="h-9 pl-9 pr-8 text-sm"
              />
              {search && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSearchClear}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Browse tab */}
        <TabsContent value="browse" className="mt-4">
          {loadingJobs ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {JOB_SKELETONS.map((s) => (
                <JobCardSkeleton key={s} />
              ))}
            </div>
          ) : jobsError ? (
            <ErrorState message="Failed to load jobs. Please try again." />
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={<Filter className="h-8 w-8 text-muted-foreground" />}
              title={
                debouncedSearch
                  ? "No jobs match your search"
                  : "No jobs available"
              }
              description={
                debouncedSearch
                  ? "Try a different keyword."
                  : "Check back soon for new opportunities."
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {jobs.map((job) => (
                  <PublicJobCard
                    key={job.id}
                    job={job}
                    onView={setSelectedJob}
                  />
                ))}
              </div>

              {/* Pagination */}
              {publicJobsData?.pagination.totalPages &&
                publicJobsData.pagination.totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setJobPageIndex((p) => Math.max(1, p - 1))}
                      disabled={jobPageIndex === 1}
                      className="h-8 text-xs"
                    >
                      Previous
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Page {jobPageIndex} of{" "}
                      {publicJobsData.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setJobPageIndex((p) => p + 1)}
                      disabled={!publicJobsData.pagination.isNext}
                      className="h-8 text-xs"
                    >
                      Next
                    </Button>
                  </div>
                )}
            </>
          )}
        </TabsContent>

        {/* My Applications tab */}
        <TabsContent value="applications" className="mt-4">
          {loadingApplications ? (
            <div className="space-y-3">
              {APP_SKELETONS.map((s) => (
                <ApplicationSkeleton key={s} />
              ))}
            </div>
          ) : applicationsError ? (
            <ErrorState message="Failed to load your applications." />
          ) : applications.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-8 w-8 text-muted-foreground" />}
              title="No applications yet"
              description="Browse jobs and hit Apply to get started."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTab("browse")}
                >
                  Browse Jobs
                </Button>
              }
            />
          ) : (
            <>
              <div className="space-y-3">
                {applications.map((app) => (
                  <ApplicationRow key={app.id} application={app} />
                ))}
              </div>

              {/* Pagination */}
              {applicationsData?.pagination.totalPages &&
                applicationsData.pagination.totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4">
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
                      Page {pageIndex} of{" "}
                      {applicationsData.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageIndex((p) => p + 1)}
                      disabled={!applicationsData.pagination.isNext}
                      className="h-8 text-xs"
                    >
                      Next
                    </Button>
                  </div>
                )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <JobDetailModal
        job={selectedJob}
        open={!!selectedJob}
        onOpenChange={(open) => !open && setSelectedJob(null)}
      />
    </div>
  );
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-border">
      <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-3 py-12">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="border-dashed border-border">
      <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-3 py-12 text-center">
        <div className="rounded-full bg-muted p-4">{icon}</div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
