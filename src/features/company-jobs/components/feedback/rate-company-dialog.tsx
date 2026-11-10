"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { StarRatingInput } from "@/components/ui/star-rating-input";
import { Textarea } from "@/components/ui/textarea";
import type { CompanyFeedbackPayload } from "../../api";
import { useSubmitCompanyFeedback } from "../../hooks/use-company-feedback";
import type { FeedbackInteractionType } from "../../types";

export type FeedbackInteraction = FeedbackInteractionType;

type Stars = CompanyFeedbackPayload["rating"];

const COMMENT_MAX = 1000;

const PROMPTS: Record<FeedbackInteraction, string> = {
  JOB: "How was your application experience?",
  TASK: "How was working on this task?",
  EVENT: "How was this event?",
  SESSION: "How was this mentorship session?",
};

interface RateCompanyDialogProps {
  interaction: FeedbackInteraction;
  entityId: string;
  companyName?: string;
  trigger: ReactNode;
}

/**
 * 1-5 star rating with an optional comment, tied to one finished
 * interaction. The backend checks eligibility and refuses duplicates; its
 * message is shown as-is.
 */
export function RateCompanyDialog({
  interaction,
  entityId,
  companyName,
  trigger,
}: RateCompanyDialogProps) {
  const submit = useSubmitCompanyFeedback();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<Stars | null>(null);
  const [comment, setComment] = useState("");

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setRating(null);
      setComment("");
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    const payload: CompanyFeedbackPayload = {
      interaction_type: interaction,
      entity_id: entityId,
      rating,
    };
    const trimmed = comment.trim();
    if (trimmed) payload.comment = trimmed;
    submit.mutate(payload, { onSuccess: () => handleOpenChange(false) });
  };

  const company = companyName || "this company";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate {company}</DialogTitle>
          <DialogDescription>
            {PROMPTS[interaction]} Your rating is shared with {company} and
            counts towards its public impact report.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <StarRatingInput
            name={`company-rating-${entityId}`}
            value={rating}
            onChange={setRating}
          />

          <div className="space-y-2">
            <Label htmlFor={`rate-comment-${entityId}`}>
              Comment{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id={`rate-comment-${entityId}`}
              rows={3}
              maxLength={COMMENT_MAX}
              value={comment}
              placeholder="What went well, and what could be better?"
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!rating || submit.isPending}>
              {submit.isPending ? "Submitting…" : "Submit rating"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
