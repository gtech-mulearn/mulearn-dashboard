/**
 * ApplicantsSection
 *
 * 📍 src/features/company-jobs/components/applicants-section.tsx
 *
 * Full applicants panel shown inside the company job detail view.
 * Includes status filter tabs, loading/empty/error states, and the applicant list.
 */

"use client";

import { Filter, Search, Users } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { AppStatus } from "../constants";
import { APP_STATUS_META } from "../constants";
import { useJobApplicants } from "../hooks";
import { ApplicantRow } from "./applicant-row";

interface ApplicantsSectionProps {
  jobId: string;
}

type FilterTab = AppStatus | "all";

const FILTER_TABS: Array<{ key: FilterTab; label: string }> = [
  { key: "all", label: "All" },
  { key: "pending", label: APP_STATUS_META.pending.label },
  { key: "in-review", label: APP_STATUS_META["in-review"].label },
  { key: "shortlisted", label: APP_STATUS_META.shortlisted.label },
  { key: "interview", label: APP_STATUS_META.interview.label },
  { key: "selected", label: APP_STATUS_META.selected.label },
  { key: "rejected", label: APP_STATUS_META.rejected.label },
];

const APPLICANT_SKELETONS = ["a1", "a2", "a3"];

function ApplicantRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-1/3 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
      <Skeleton className="h-6 w-24 rounded-full" />
    </div>
  );
}

function normalizeStatus(status: string): AppStatus {
  if (!status) return "pending";
  const lower = status.toLowerCase();
  if (lower === "pending") return "pending";
  if (lower === "in-review" || lower === "in_review" || lower === "in review")
    return "in-review";
  if (lower === "shortlisted") return "shortlisted";
  if (lower === "interview") return "interview";
  if (lower === "selected" || lower === "accepted") return "selected";
  if (lower === "rejected") return "rejected";
  return "pending";
}

export function ApplicantsSection({ jobId }: ApplicantsSectionProps) {
  const [statusFilter, setStatusFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [sortBy, setSortBy] = useState<string>("-karma");

  const currentBackendStatus =
    statusFilter === "all"
      ? undefined
      : APP_STATUS_META[statusFilter as AppStatus]?.backendStatus ||
        statusFilter;

  // Server-side paginated query for the active status tab & page
  const { data, isLoading, isError } = useJobApplicants(jobId, {
    status: currentBackendStatus,
    search: search || undefined,
    sortBy: sortBy,
    pageIndex: pageIndex,
  });

  // Queries for backend-provided per-status tab counts (perPage: 1)
  const { data: allCountData } = useJobApplicants(jobId, { perPage: 1 });
  const { data: pendingCountData } = useJobApplicants(jobId, {
    status: APP_STATUS_META.pending.backendStatus,
    perPage: 1,
  });
  const { data: inReviewCountData } = useJobApplicants(jobId, {
    status: APP_STATUS_META["in-review"].backendStatus,
    perPage: 1,
  });
  const { data: shortlistedCountData } = useJobApplicants(jobId, {
    status: APP_STATUS_META.shortlisted.backendStatus,
    perPage: 1,
  });
  const { data: interviewCountData } = useJobApplicants(jobId, {
    status: APP_STATUS_META.interview.backendStatus,
    perPage: 1,
  });
  const { data: selectedCountData } = useJobApplicants(jobId, {
    status: APP_STATUS_META.selected.backendStatus,
    perPage: 1,
  });
  const { data: rejectedCountData } = useJobApplicants(jobId, {
    status: APP_STATUS_META.rejected.backendStatus,
    perPage: 1,
  });

  const rawApplicants = data?.applicants ?? [];

  // Client-side filter fallback (guarantees non-matching applicants are excluded if backend ignores status parameter)
  const displayedApplicants = rawApplicants.filter((a) => {
    if (statusFilter !== "all") {
      const norm = normalizeStatus(a.status);
      if (norm !== statusFilter) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const nameMatch = a.applicant_name?.toLowerCase().includes(q);
      const emailMatch = a.applicant_email?.toLowerCase().includes(q);
      if (!nameMatch && !emailMatch) return false;
    }
    return true;
  });

  // Local status counts fallback
  const localCountByStatus = rawApplicants.reduce<Record<string, number>>(
    (acc, a) => {
      const key = normalizeStatus(a.status);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const totalAllCount =
    allCountData?.pagination.count ??
    data?.pagination.count ??
    rawApplicants.length;

  const pendingCnt = pendingCountData?.pagination.count;
  const inReviewCnt = inReviewCountData?.pagination.count;
  const shortlistedCnt = shortlistedCountData?.pagination.count;
  const interviewCnt = interviewCountData?.pagination.count;
  const selectedCnt = selectedCountData?.pagination.count;
  const rejectedCnt = rejectedCountData?.pagination.count;

  const backendSupportsStatusCounts =
    (pendingCnt !== undefined && pendingCnt !== totalAllCount) ||
    (inReviewCnt !== undefined && inReviewCnt !== totalAllCount) ||
    (shortlistedCnt !== undefined && shortlistedCnt !== totalAllCount) ||
    (interviewCnt !== undefined && interviewCnt !== totalAllCount) ||
    (selectedCnt !== undefined && selectedCnt !== totalAllCount) ||
    (rejectedCnt !== undefined && rejectedCnt !== totalAllCount);

  const tabCounts: Record<FilterTab, number> = {
    all: totalAllCount,
    pending: backendSupportsStatusCounts
      ? (pendingCnt ?? 0)
      : (localCountByStatus.pending ?? 0),
    "in-review": backendSupportsStatusCounts
      ? (inReviewCnt ?? 0)
      : (localCountByStatus["in-review"] ?? 0),
    shortlisted: backendSupportsStatusCounts
      ? (shortlistedCnt ?? 0)
      : (localCountByStatus.shortlisted ?? 0),
    interview: backendSupportsStatusCounts
      ? (interviewCnt ?? 0)
      : (localCountByStatus.interview ?? 0),
    selected: backendSupportsStatusCounts
      ? (selectedCnt ?? 0)
      : (localCountByStatus.selected ?? 0),
    rejected: backendSupportsStatusCounts
      ? (rejectedCnt ?? 0)
      : (localCountByStatus.rejected ?? 0),
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-base font-semibold text-foreground">Applicants</h2>
        {tabCounts.all > 0 && (
          <Badge variant="secondary" className="ml-1 text-xs">
            {tabCounts.all}
          </Badge>
        )}
      </div>

      {/* Search and Sort */}
      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[150px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            id="applicant-search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageIndex(1);
            }}
            placeholder="Search applicants…"
            className="h-9 pl-9 text-sm"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 h-9 text-sm">
              <Filter className="h-3.5 w-3.5" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              value={sortBy}
              onValueChange={(v) => {
                setSortBy(v);
                setPageIndex(1);
              }}
            >
              <DropdownMenuRadioItem value="-karma" className="text-xs">
                Karma (High to Low)
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="karma" className="text-xs">
                Karma (Low to High)
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filter tabs */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {FILTER_TABS.map(({ key, label }) => {
          const count = tabCounts[key];
          const isActive = statusFilter === key;

          return (
            <Button
              key={key}
              type="button"
              variant="secondary"
              onClick={() => {
                setStatusFilter(key);
                setPageIndex(1);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs bg-transparent border-none font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {label}
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold leading-none">
                {count}
              </span>
            </Button>
          );
        })}
      </div>

      {/* List */}
      <div className="mt-4 space-y-2">
        {isLoading ? (
          APPLICANT_SKELETONS.map((s) => <ApplicantRowSkeleton key={s} />)
        ) : isError ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Failed to load applicants.
          </p>
        ) : displayedApplicants.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {statusFilter === "all"
              ? "No applicants yet."
              : `No ${APP_STATUS_META[statusFilter as AppStatus]?.label.toLowerCase()} applicants.`}
          </p>
        ) : (
          displayedApplicants.map((a) => (
            <ApplicantRow key={a.id} applicant={a} jobId={jobId} />
          ))
        )}

        {/* Pagination Controls */}
        {!isLoading &&
          !isError &&
          data?.pagination.totalPages &&
          data.pagination.totalPages > 1 && (
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
    </div>
  );
}
