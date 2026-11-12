"use client";

import { Clock, MessageSquareWarning, XCircle } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatShortDate } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import { useCompanyAccess } from "../hooks/use-company-access";
import {
  useApproveJob,
  useRejectJob,
  useRequestJobChanges,
} from "../hooks/use-job-mutations";
import type { Job } from "../types";
import { JobReviewDialog, type JobReviewKind } from "./job-review-dialog";

/** The backend refuses edits to a rejected job (403). */
export function isJobEditable(status: string | null | undefined): boolean {
  return status !== "Rejected";
}

function Callout({
  tone,
  icon: Icon,
  title,
  children,
}: {
  tone: "amber" | "red" | "sky";
  icon: typeof Clock;
  title: string;
  children: ReactNode;
}) {
  const tones = {
    amber:
      "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400",
    red: "border-destructive/30 bg-destructive/5 text-destructive",
    sky: "border-sky-500/30 bg-sky-500/5 text-sky-700 dark:text-sky-400",
  };
  return (
    <div className={cn("rounded-xl border p-4", tones[tone])}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {title}
      </div>
      <div className="mt-2 text-sm text-foreground">{children}</div>
    </div>
  );
}

/**
 * Approval state of a company job: the revision note or rejection reason,
 * review actions for the owner/co-admins while it is pending, and who
 * posted and approved it.
 */
export function JobReviewPanel({ job }: { job: Job }) {
  const { can } = useCompanyAccess();
  const approve = useApproveJob();
  const reject = useRejectJob();
  const requestChanges = useRequestJobChanges();
  const [review, setReview] = useState<JobReviewKind | null>(null);

  const trail = [
    job.created_by_name ? `Posted by ${job.created_by_name}` : null,
    job.approved_by_name
      ? `Approved by ${job.approved_by_name}${
          job.approved_at ? ` on ${formatShortDate(job.approved_at)}` : ""
        }`
      : null,
  ].filter(Boolean);

  const submitReview = (text: string) => {
    const close = { onSuccess: () => setReview(null) };
    if (review === "reject") {
      reject.mutate({ jobId: job.id, reason: text }, close);
    } else {
      requestChanges.mutate({ jobId: job.id, note: text }, close);
    }
  };

  let callout: ReactNode = null;
  if (job.status === "Needs Revision") {
    callout = (
      <Callout tone="amber" icon={MessageSquareWarning} title="Owner's note">
        <p className="whitespace-pre-line">
          {job.rejection_reason || "Changes were requested on this job."}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Edit the job and resubmit it for approval.
        </p>
      </Callout>
    );
  } else if (job.status === "Rejected") {
    callout = (
      <Callout tone="red" icon={XCircle} title="This job was rejected">
        {job.rejection_reason && (
          <p className="whitespace-pre-line">{job.rejection_reason}</p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          Rejected jobs can&apos;t be edited. Post a new job instead.
        </p>
      </Callout>
    );
  } else if (job.status === "Pending Approval") {
    callout = (
      <Callout tone="sky" icon={Clock} title="Waiting for approval">
        {can.approveJobs ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>Approving publishes this job to learners.</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={approve.isPending}
                onClick={() => approve.mutate(job.id)}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setReview("changes")}
              >
                Request changes
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setReview("reject")}
              >
                Reject
              </Button>
            </div>
          </div>
        ) : (
          <p>
            The company owner or a co-admin will review it before it goes live.
          </p>
        )}
      </Callout>
    );
  }

  if (!callout && trail.length === 0) return null;

  return (
    <div className="space-y-3">
      {callout}
      {trail.length > 0 && (
        <p className="text-xs text-muted-foreground">{trail.join(" · ")}</p>
      )}
      <JobReviewDialog
        kind={review}
        jobTitle={job.title}
        authorName={job.created_by_name}
        isPending={reject.isPending || requestChanges.isPending}
        onOpenChange={(open) => {
          if (!open) setReview(null);
        }}
        onSubmit={submitReview}
      />
    </div>
  );
}
