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
  JOBS_DEFAULT_PAGE_INDEX,
  JOBS_DEFAULT_PAGE_SIZE,
} from "@/features/company-jobs/constants";
import { useJobs } from "@/features/company-jobs/hooks";
import { useDebounce } from "@/hooks/use-debounce";

export default function CompanyJobsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(JOBS_DEFAULT_PAGE_INDEX);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, error } = useJobs({
    pageIndex: page,
    perPage: JOBS_DEFAULT_PAGE_SIZE,
    search: debouncedSearch || undefined,
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

  return (
    <CompanyStatusGuard>
      <div className="space-y-6 p-1">
        <JobsPageHeader
          searchValue={search}
          onSearchChange={handleSearchChange}
          onCreateJob={handleCreateJob}
          totalJobs={data?.pagination.count}
        />

        {/* Loading */}
        {isLoading && <JobsListSkeleton />}

        {/* Error */}
        {isError && !isLoading && (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card/50 p-8">
            <div className="rounded-full bg-red-50 p-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Failed to load jobs. Please try again."}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && data && data.jobs.length === 0 && (
          <JobsEmptyState
            onCreateJob={handleCreateJob}
            hasSearchFilter={!!debouncedSearch}
          />
        )}

        {/* Job list */}
        {!isLoading && !isError && data && data.jobs.length > 0 && (
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
