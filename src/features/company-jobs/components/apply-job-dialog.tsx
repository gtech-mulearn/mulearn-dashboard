/**
 * ApplyJobDialog
 *
 * 📍 src/features/company-jobs/components/apply-job-dialog.tsx
 *
 * Modal dialog for a learner to apply to a public job with an optional cover note.
 */

"use client";

import { CheckCircle } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useApplyJob,
  useLearnerApplications,
  useResubmitApplication,
} from "../hooks";
import type { PublicJob } from "../types";

interface ApplyJobDialogProps {
  job: PublicJob | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplyJobDialog({
  job,
  open,
  onOpenChange,
}: ApplyJobDialogProps) {
  const [coverNote, setCoverNote] = useState("");
  const [resumeLink, setResumeLink] = useState("");
  const {
    mutate: apply,
    isPending: isApplying,
    isSuccess: applySuccess,
  } = useApplyJob();
  const {
    mutate: resubmit,
    isPending: isResubmitting,
    isSuccess: resubmitSuccess,
  } = useResubmitApplication();

  const { data: appsResponse } = useLearnerApplications();
  const existingApp = appsResponse?.applications.find(
    (app) => app.job.id === job?.id,
  );
  const isRejected = existingApp?.status === "rejected";
  const isPending = isApplying || isResubmitting;
  const isSuccess = applySuccess || resubmitSuccess;

  const handleApply = () => {
    if (!job || !resumeLink.trim()) return;

    const onSuccessOptions = {
      onSuccess: () => {
        setTimeout(() => {
          onOpenChange(false);
          setCoverNote("");
          setResumeLink("");
        }, 1200);
      },
    };

    if (isRejected && existingApp) {
      resubmit(
        {
          appId: existingApp.id,
          payload: {
            resume_link: resumeLink.trim(),
            cover_letter: coverNote.trim() || undefined,
          },
        },
        onSuccessOptions,
      );
    } else {
      apply(
        {
          jobId: job.id,
          resume_link: resumeLink.trim(),
          cover_letter: coverNote.trim() || undefined,
        },
        onSuccessOptions,
      );
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setCoverNote("");
      setResumeLink("");
    }
    onOpenChange(open);
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">{job.title}</DialogTitle>
          <DialogDescription className="capitalize text-sm">
            {job.job_type?.replace(/_/g, " ")} · {job.location}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resume Link */}
          <div className="space-y-1.5">
            <label
              htmlFor="resume-link"
              className="text-sm font-medium text-foreground"
            >
              Resume Link <span className="text-destructive">*</span>
            </label>
            <Input
              id="resume-link"
              type="url"
              placeholder="e.g., Google Drive, Notion, Portfolio URL…"
              value={resumeLink}
              onChange={(e) => setResumeLink(e.target.value)}
              required
            />
          </div>

          {/* Cover note */}
          <div className="space-y-1.5">
            <label
              htmlFor="cover-note"
              className="text-sm font-medium text-foreground"
            >
              Cover note{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <Textarea
              id="cover-note"
              placeholder="Tell the company why you're a great fit…"
              rows={4}
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button
            id="submit-application"
            onClick={handleApply}
            disabled={isPending || isSuccess || !resumeLink.trim()}
          >
            {isSuccess ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {isRejected ? "Resubmitted!" : "Applied!"}
              </>
            ) : isPending ? (
              isRejected ? (
                "Resubmitting…"
              ) : (
                "Applying…"
              )
            ) : isRejected ? (
              "Resubmit Application"
            ) : (
              "Apply Now"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
