"use client";

import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  CompanyStatusGuard,
  JobsEmptyState,
  JobsList,
  JobsListSkeleton,
  JobsPageHeader,
} from "@/features/company-jobs/components";
import {
  JOB_SORT_DEFAULT,
  JOBS_DEFAULT_PAGE_INDEX,
  JOBS_DEFAULT_PAGE_SIZE,
} from "@/features/company-jobs/constants";
import { useJobs } from "@/features/company-jobs/hooks";
import type { JobSortValue } from "@/features/company-jobs/types";
import { useDebounce } from "@/hooks/use-debounce";

export function CompanyJobsPageClient() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(JOBS_DEFAULT_PAGE_INDEX);
  // Newest listings first. The backend model declares no Meta.ordering, so
  // without an explicit sort the database is free to return rows in any order.
  const [sortBy, setSortBy] = useState<JobSortValue>(JOB_SORT_DEFAULT);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, error } = useJobs({
    pageIndex: page,
    perPage: JOBS_DEFAULT_PAGE_SIZE,
    search: debouncedSearch || undefined,
    sortBy,
  });

  const handleCreateJob = useCallback(() => {
    router.push("/dashboard/company/jobs/create");
  }, [router]);

  const handleViewJob = useCallback(
    (jobId: string) => {
      router.push(`/dashboard/company/jobs/${jobId}`);
    },
    [router],
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(JOBS_DEFAULT_PAGE_INDEX); // Reset to first page on search
  }, []);

  const handleSortChange = useCallback((value: JobSortValue) => {
    setSortBy(value);
    setPage(JOBS_DEFAULT_PAGE_INDEX); // Page 1 of the new order, not the old
  }, []);

  return (
    <CompanyStatusGuard>
      <div className="space-y-6 p-1">
        <JobsPageHeader
          searchValue={search}
          onSearchChange={handleSearchChange}
          onCreateJob={handleCreateJob}
          totalJobs={data?.pagination.count}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />

        {/* Loading */}
        {isLoading && <JobsListSkeleton />}

        {/* Error */}
        {isError && !isLoading && (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card/50 p-8">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <p className="text-sm text-muted-foreground">
              {process.env.NODE_ENV === "development" && error instanceof Error
                ? error.message
                : "Failed to load jobs. Please try again."}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading &&
          !isError &&
          data &&
          (!data.jobs || data.jobs.length === 0) && (
            <JobsEmptyState
              onCreateJob={handleCreateJob}
              hasSearchFilter={!!debouncedSearch}
            />
          )}

        {/* Job list */}
        {!isLoading && !isError && data?.jobs && data.jobs.length > 0 && (
          <JobsList
            jobs={data.jobs}
            pagination={data.pagination}
            currentPage={page}
            onPageChange={setPage}
            onViewJob={handleViewJob}
          />
        )}
      </div>
    </CompanyStatusGuard>
  );
}
