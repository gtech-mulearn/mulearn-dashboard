/**
 * ApplyJobDialog
 *
 * 📍 src/features/company-jobs/components/apply-job-dialog.tsx
 *
 * Modal dialog for a learner to apply to a public job with an optional cover note.
 */

"use client";

import { CheckCircle, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useApplyJob } from "../hooks";
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
  const { mutate: apply, isPending, isSuccess } = useApplyJob();

  const handleApply = () => {
    if (!job) return;
    apply(
      { jobId: job.id, coverNote: coverNote.trim() || undefined },
      {
        onSuccess: () => {
          setTimeout(() => {
            onOpenChange(false);
            setCoverNote("");
          }, 1200);
        },
      },
    );
  };

  const handleClose = (open: boolean) => {
    if (!open) setCoverNote("");
    onOpenChange(open);
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">{job.title}</DialogTitle>
          <DialogDescription className="capitalize text-sm">
            {job.job_type.replace(/_/g, " ")} · {job.location}
          </DialogDescription>
        </DialogHeader>

        {/* Requirements */}
        <div className="flex flex-wrap gap-2">
          {job.karma_reward ? (
            <Badge className="gap-1 border bg-primary/10 text-primary text-xs border-primary/20">
              +{job.karma_reward} karma reward
            </Badge>
          ) : null}
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

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button
            id="submit-application"
            onClick={handleApply}
            disabled={isPending || isSuccess}
          >
            {isSuccess ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Applied!
              </>
            ) : isPending ? (
              "Applying…"
            ) : (
              "Apply Now"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
