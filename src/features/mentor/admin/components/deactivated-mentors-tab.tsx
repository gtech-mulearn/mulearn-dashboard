"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { RefreshCw, UserX } from "lucide-react";
import { useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatShortDate } from "@/lib/datetime";
import {
  type DeactivatedMentor,
  fetchDeactivatedMentors,
} from "../api/mentor-verify.api";
import {
  mentorVerifyKeys,
  useReactivateMentor,
} from "../hooks/use-mentor-verify";

const PER_PAGE = 10;

/**
 * Deactivated mentors (BE-5). Reactivation targets the UserMentor id the
 * backend's admin/reactivate/<user_mentor_id>/ expects.
 */
export function DeactivatedMentorsTab() {
  const [page, setPage] = useState(1);
  const [reactivating, setReactivating] = useState<DeactivatedMentor | null>(
    null,
  );
  const reactivate = useReactivateMentor();
  const { data, isLoading, isError } = useQuery({
    queryKey: [...mentorVerifyKeys.all, "deactivated", page] as const,
    queryFn: () => fetchDeactivatedMentors({ page, perPage: PER_PAGE }),
    placeholderData: keepPreviousData,
    retry: false,
  });

  const mentors = data?.data ?? [];
  const nameOf = (m: DeactivatedMentor) =>
    m.user_full_name || m.muid || "This mentor";

  if (isLoading) {
    return (
      <div className="space-y-2">
        {(["a", "b", "c"] as const).map((k) => (
          <Skeleton key={k} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
        We couldn&apos;t load deactivated mentors.
      </p>
    );
  }

  if (mentors.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-12 text-center">
        <UserX
          className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50"
          aria-hidden="true"
        />
        <p className="text-sm text-muted-foreground">No deactivated mentors.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="divide-y rounded-lg border bg-card">
        {mentors.map((mentor) => (
          <li
            key={mentor.id}
            className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {nameOf(mentor)}
              </p>
              <p className="text-xs text-muted-foreground">
                {[
                  mentor.muid,
                  mentor.updated_at
                    ? `Deactivated ${formatShortDate(mentor.updated_at)}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => setReactivating(mentor)}
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Reactivate
            </Button>
          </li>
        ))}
      </ul>

      {(data?.totalPages ?? 1) > 1 && (
        <Pagination
          currentPage={page}
          totalPages={data?.totalPages ?? 1}
          perPage={PER_PAGE}
          totalCount={data?.totalItems}
          handlePreviousClick={() => setPage((p) => Math.max(1, p - 1))}
          handleNextClick={() =>
            setPage((p) => Math.min(data?.totalPages ?? 1, p + 1))
          }
        />
      )}

      <ConfirmDialog
        open={reactivating !== null}
        onOpenChange={(open) => {
          if (!open) setReactivating(null);
        }}
        variant="warning"
        title={
          reactivating ? `Reactivate ${nameOf(reactivating)}?` : "Reactivate?"
        }
        description="This restores their mentor capabilities right away: sessions, persona switch and roster visibility, without re-verification."
        confirmLabel="Reactivate mentor"
        isPending={reactivate.isPending}
        onConfirm={() => {
          if (!reactivating) return;
          reactivate.mutate(reactivating.id, {
            onSettled: () => setReactivating(null),
          });
        }}
      />
    </div>
  );
}
