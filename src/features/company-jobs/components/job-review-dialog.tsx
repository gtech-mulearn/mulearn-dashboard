"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type JobReviewKind = "reject" | "changes";

const COPY: Record<
  JobReviewKind,
  {
    title: string;
    description: (job: string, author: string) => string;
    label: string;
    placeholder: string;
    submit: string;
    missing: string;
  }
> = {
  changes: {
    title: "Request changes",
    description: (job, author) =>
      `Tell ${author} what to change in "${job}". It moves to Needs Revision until they resubmit it.`,
    label: "Note for the mentor",
    placeholder: "e.g. Add a salary range and shorten the description.",
    submit: "Send request",
    missing: "Add a note so the mentor knows what to change.",
  },
  reject: {
    title: "Reject this job?",
    description: (job, author) =>
      `"${job}" won't be published. ${author} will see your reason.`,
    label: "Reason",
    placeholder: "e.g. We already have an opening for this role.",
    submit: "Reject job",
    missing: "Add a reason so the mentor knows why.",
  },
};

interface JobReviewDialogProps {
  kind: JobReviewKind | null;
  jobTitle: string;
  authorName?: string | null;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (text: string) => void;
}

/** Collects the required reason (reject) or note (request changes). */
export function JobReviewDialog({
  kind,
  jobTitle,
  authorName,
  isPending,
  onOpenChange,
  onSubmit,
}: JobReviewDialogProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  // A new review starts empty.
  useEffect(() => {
    if (kind) {
      setText("");
      setError(null);
    }
  }, [kind]);

  if (!kind) return null;
  const copy = COPY[kind];
  const author = authorName || "the mentor";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError(copy.missing);
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>
            {copy.description(jobTitle, author)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="job-review-text">{copy.label}</Label>
            <Textarea
              id="job-review-text"
              rows={4}
              value={text}
              placeholder={copy.placeholder}
              aria-invalid={!!error}
              aria-describedby={error ? "job-review-error" : undefined}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError(null);
              }}
            />
            {error && (
              <p
                id="job-review-error"
                role="alert"
                className="text-xs text-destructive"
              >
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={kind === "reject" ? "destructive" : "default"}
              disabled={isPending}
            >
              {isPending ? "Sending…" : copy.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
