"use client";

import { Clock, RefreshCw } from "lucide-react";
import { useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import { Button } from "@/components/ui/button";
import { formatShortDate } from "@/lib/datetime";
import {
  useApproveJob,
  useRejectJob,
  useRequestJobChanges,
} from "../hooks/use-job-mutations";
import { usePendingJobs } from "../hooks/use-pending-jobs";
import type { Job } from "../types";
import { JobReviewDialog, type JobReviewKind } from "./job-review-dialog";

const PAGE_SIZE = 5;

interface PendingJobApprovalsProps {
  onViewJob: (jobId: string) => void;
}

/**
 * Jobs that company mentors submitted and the owner or a co-admin must
 * approve, send back with a note, or reject. Hidden when nothing waits.
 */
export function PendingJobApprovals({ onViewJob }: PendingJobApprovalsProps) {
  const [page, setPage] = useState(1);
  const pending = usePendingJobs({ page, perPage: PAGE_SIZE });
  const approve = useApproveJob();
  const reject = useRejectJob();
  const requestChanges = useRequestJobChanges();
  const [review, setReview] = useState<{
    kind: JobReviewKind;
    job: Job;
  } | null>(null);

  if (pending.isError) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-dashed p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          We couldn&apos;t load the jobs waiting for your approval.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => pending.refetch()}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
      </div>
    );
  }

  const jobs = pending.data?.jobs ?? [];
  if (pending.isLoading || jobs.length === 0) return null;

  const total = pending.data?.pagination.count || jobs.length;
  const totalPages = pending.data?.pagination.totalPages ?? 1;

  const submitReview = (text: string) => {
    if (!review) return;
    const close = { onSuccess: () => setReview(null) };
    if (review.kind === "reject") {
      reject.mutate({ jobId: review.job.id, reason: text }, close);
    } else {
      requestChanges.mutate({ jobId: review.job.id, note: text }, close);
    }
  };

  return (
    <section
      aria-labelledby="pending-jobs-heading"
      className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"
    >
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-amber-600" aria-hidden="true" />
        <h2
          id="pending-jobs-heading"
          className="text-sm font-semibold text-foreground"
        >
          Waiting for your approval ({total})
        </h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Jobs your company mentors posted. Approving publishes them to learners.
      </p>

      <ul className="mt-3 divide-y rounded-lg border bg-card">
        {jobs.map((job) => (
          <li
            key={job.id}
            className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <button
                type="button"
                className="max-w-full truncate text-left text-sm font-medium text-foreground hover:underline"
                onClick={() => onViewJob(job.id)}
              >
                {job.title}
              </button>
              <p className="text-xs text-muted-foreground">
                {[
                  job.job_type,
                  job.created_by_name
                    ? `Posted by ${job.created_by_name}`
                    : null,
                  job.created_at ? formatShortDate(job.created_at) : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                size="sm"
                disabled={approve.isPending && approve.variables === job.id}
                onClick={() => approve.mutate(job.id)}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setReview({ kind: "changes", job })}
              >
                Request changes
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setReview({ kind: "reject", job })}
              >
                Reject
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="mt-3">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            perPage={PAGE_SIZE}
            totalCount={pending.data?.pagination.count}
            handlePreviousClick={() => setPage((p) => Math.max(1, p - 1))}
            handleNextClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </div>
      )}

      <JobReviewDialog
        kind={review?.kind ?? null}
        jobTitle={review?.job.title ?? ""}
        authorName={review?.job.created_by_name}
        isPending={reject.isPending || requestChanges.isPending}
        onOpenChange={(open) => {
          if (!open) setReview(null);
        }}
        onSubmit={submitReview}
      />
    </section>
  );
}
