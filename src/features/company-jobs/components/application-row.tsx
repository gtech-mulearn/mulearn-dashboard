/**
 * ApplicationRow
 *
 * 📍 src/features/company-jobs/components/application-row.tsx
 *
 * A row in the learner's "My Applications" tab.
 */

import { MoreVertical, RefreshCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AppStatus } from "../constants";
import { useResubmitApplication, useWithdrawApplication } from "../hooks";
import type { LearnerApplication } from "../types";
import { ApplicationStatusBadge } from "./application-status-badge";

interface ApplicationRowProps {
  application: LearnerApplication;
}

function formatDate(iso: string) {
  const d = iso ? new Date(iso) : null;
  return d && !isNaN(d.getTime())
    ? d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";
}

export function ApplicationRow({ application }: ApplicationRowProps) {
  const { job } = application;
  const { mutate: withdraw, isPending: isWithdrawing } =
    useWithdrawApplication();
  const { mutate: resubmit, isPending: isResubmitting } =
    useResubmitApplication();

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [resubmitOpen, setResubmitOpen] = useState(false);

  const [resumeLink, setResumeLink] = useState(application.resume_link || "");
  const [coverLetter, setCoverLetter] = useState(
    application.cover_letter || "",
  );

  const handleWithdraw = () => {
    withdraw(application.id, {
      onSuccess: () => setWithdrawOpen(false),
    });
  };

  const handleResubmit = () => {
    resubmit(
      {
        appId: application.id,
        payload: {
          resume_link: resumeLink.trim() || undefined,
          cover_letter: coverLetter.trim() || undefined,
        },
      },
      {
        onSuccess: () => setResubmitOpen(false),
      },
    );
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/30">
      {job.company_logo && (
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={job.company_logo}
            alt={job.company_name || "Company"}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {job.title}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span className="capitalize">
            {job.job_type ? job.job_type.replace(/_/g, " ") : ""}
          </span>
          <span>·</span>
          <span>{job.company_name}</span>
          <span>·</span>
          <span>{formatDate(application.applied_at)}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <ApplicationStatusBadge status={application.status as AppStatus} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {application.status === "rejected" && (
              <DropdownMenuItem
                onClick={() => setResubmitOpen(true)}
                className="gap-2"
              >
                <RefreshCcw className="h-4 w-4" /> Resubmit Application
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => setWithdrawOpen(true)}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive gap-2"
            >
              <Trash2 className="h-4 w-4" /> Withdraw
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to withdraw your application for {job.title}{" "}
              at {job.company_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setWithdrawOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleWithdraw}
              disabled={isWithdrawing}
            >
              {isWithdrawing ? "Withdrawing..." : "Withdraw"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resubmit Dialog */}
      <Dialog open={resubmitOpen} onOpenChange={setResubmitOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Resubmit Application</DialogTitle>
            <DialogDescription>
              Update your application details for {job.title} at{" "}
              {job.company_name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label
                htmlFor="resubmit-resume-link"
                className="text-sm font-medium"
              >
                Resume Link
              </label>
              <Input
                id="resubmit-resume-link"
                value={resumeLink}
                onChange={(e) => setResumeLink(e.target.value)}
                placeholder="https://drive.google.com/..."
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="resubmit-cover-letter"
                className="text-sm font-medium"
              >
                Cover Letter{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <Textarea
                id="resubmit-cover-letter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={4}
                placeholder="Address the previous concerns..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setResubmitOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleResubmit}
              disabled={isResubmitting || !resumeLink.trim()}
            >
              {isResubmitting ? "Resubmitting..." : "Resubmit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
