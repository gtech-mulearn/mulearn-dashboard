"use client";

import { Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  usePendingIgSponsorships,
  useReviewIgSponsorship,
} from "@/features/company-jobs/hooks/use-ig-sponsorships";
import type { PendingIgSponsorship } from "@/features/company-jobs/types";
import { formatShortDate } from "@/lib/datetime";

/**
 * Platform-admin queue of companies asking to sponsor an interest group.
 * Hidden when nothing waits (or the queue can't be loaded).
 */
export function PendingIgSponsorships() {
  const { data: requests = [], isError } = usePendingIgSponsorships();
  const review = useReviewIgSponsorship();
  const [rejecting, setRejecting] = useState<PendingIgSponsorship | null>(null);

  if (isError || requests.length === 0) return null;

  const busyFor = (igId: string) =>
    review.isPending && review.variables?.igId === igId;

  return (
    <section
      aria-labelledby="pending-sponsorships-heading"
      className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"
    >
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-amber-600" aria-hidden="true" />
        <h2
          id="pending-sponsorships-heading"
          className="text-sm font-semibold text-foreground"
        >
          IG sponsorship requests ({requests.length})
        </h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Approving shows the company as the interest group&apos;s sponsor.
      </p>
      <ul className="mt-3 divide-y rounded-lg border bg-card">
        {requests.map((request) => (
          <li
            key={request.ig_id}
            className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {request.ig_name}
              </p>
              <p className="text-xs text-muted-foreground">
                Requested by {request.company_name}
                {request.requested_at
                  ? ` · ${formatShortDate(request.requested_at)}`
                  : ""}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                size="sm"
                disabled={busyFor(request.ig_id)}
                onClick={() =>
                  review.mutate({
                    igId: request.ig_id,
                    payload: { approve: true },
                  })
                }
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={busyFor(request.ig_id)}
                onClick={() => setRejecting(request)}
              >
                Reject
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={rejecting !== null}
        onOpenChange={(open) => {
          if (!open) setRejecting(null);
        }}
        variant="destructive"
        title="Reject this sponsorship?"
        description={`${rejecting?.company_name ?? "The company"} won't be shown as the sponsor of ${rejecting?.ig_name ?? "this interest group"}.`}
        confirmLabel="Reject"
        isPending={review.isPending}
        onConfirm={() => {
          if (!rejecting) return;
          review.mutate(
            { igId: rejecting.ig_id, payload: { approve: false } },
            { onSettled: () => setRejecting(null) },
          );
        }}
      />
    </section>
  );
}
