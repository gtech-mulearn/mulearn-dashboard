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
import { useState } from "react";
import type { AppStatus } from "../constants";
import { APP_STATUS_META, APP_STATUS_TRANSITIONS } from "../constants";
import { useUpdateApplicantStatus } from "../hooks";
import type { JobApplicant } from "../types";
import { ApplicationStatusBadge } from "./application-status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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
  const nextStatuses =
    APP_STATUS_TRANSITIONS[applicant.status as AppStatus] || [];

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleStatusChange = (next: AppStatus) => {
    if (next === "rejected") {
      setRejectOpen(true);
      return;
    }
    updateStatus({
      // jobId,
      appId: applicant.id,
      status: APP_STATUS_META[next]?.backendStatus || next,
    });
  };

  const handleRejectSubmit = () => {
    updateStatus(
      {
        // jobId,
        appId: applicant.id,
        status: "Rejected",
        rejection_reason: rejectReason.trim() || undefined,
      },
      {
        onSuccess: () => {
          setRejectOpen(false);
          setRejectReason("");
        },
      },
    );
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/30">
      {/* Avatar initials */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
        {getInitials(applicant.applicant_name || "A")}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {applicant.applicant_name}
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span>{applicant.applicant_email}</span>
          <span>·</span>
          <span>
            {(() => {
              const d = applicant.applied_at
                ? new Date(applicant.applied_at)
                : null;
              return d && !isNaN(d.getTime())
                ? `Applied on ${d.toLocaleDateString()}`
                : "Applied on N/A";
            })()}
          </span>
          {applicant.resume_link && (
            <>
              <span>·</span>
              <a
                href={applicant.resume_link}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline font-medium"
              >
                View Resume
              </a>
            </>
          )}
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
                if (!nm) return null;
                return (
                  <DropdownMenuItem
                    key={next}
                    onClick={() =>
                      updateStatus({ appId: applicant.id, status: next })
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

      {/* Rejection Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Applicant</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject {applicant.applicant_name}? You
              can optionally provide a reason.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label htmlFor="reject-reason" className="text-sm font-medium">
                Rejection Reason{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <Textarea
                id="reject-reason"
                placeholder="e.g. Profile does not match the required experience level."
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={isPending}
            >
              {isPending ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
