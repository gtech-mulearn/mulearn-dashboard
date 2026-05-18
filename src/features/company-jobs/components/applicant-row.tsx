/**
 * ApplicantRow
 *
 * 📍 src/features/company-jobs/components/applicant-row.tsx
 *
 * Single row in the Applicants section of a company job detail view.
 * Shows applicant info + FSM-validated status transition dropdown.
 */

"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppStatus } from "../constants";
import { APP_STATUS_META, APP_STATUS_TRANSITIONS } from "../constants";
import { useUpdateApplicantStatus } from "../hooks";
import type { JobApplicant } from "../types";
import { ApplicationStatusBadge } from "./application-status-badge";

interface ApplicantRowProps {
  applicant: JobApplicant;
  jobId: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ApplicantRow({ applicant, jobId }: ApplicantRowProps) {
  const { mutate: updateStatus, isPending } = useUpdateApplicantStatus();
  const nextStatuses = APP_STATUS_TRANSITIONS[applicant.status];

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/30">
      {/* Avatar initials */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
        {getInitials(applicant.full_name)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {applicant.full_name}
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span>@{applicant.muid}</span>
          {applicant.district && (
            <>
              <span>·</span>
              <span>{applicant.district}</span>
            </>
          )}
          <span>·</span>
          <span className="font-medium text-foreground">
            {applicant.karma.toLocaleString()} karma
          </span>
          <span>·</span>
          <span>{applicant.level.name}</span>
        </div>
      </div>

      {/* Status badge + FSM transition */}
      <div className="flex items-center gap-2 shrink-0">
        <ApplicationStatusBadge status={applicant.status} />

        {nextStatuses.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                className="h-7 gap-1 rounded-lg px-2 text-xs"
              >
                Move to
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {nextStatuses.map((next: AppStatus) => {
                const nm = APP_STATUS_META[next];
                return (
                  <DropdownMenuItem
                    key={next}
                    onClick={() =>
                      updateStatus({ jobId, appId: applicant.id, status: next })
                    }
                    className="gap-2 text-xs"
                  >
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: nm.dotVar }}
                    />
                    {nm.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
