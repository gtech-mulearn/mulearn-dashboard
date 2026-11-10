"use client";

import { Loader2, MessageSquarePlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import {
  StarRatingInput,
  type StarValue,
} from "@/components/ui/star-rating-input";
import { Textarea } from "@/components/ui/textarea";
import { buildSessionFeedbackBody } from "@/features/mentor/sessions/lib/session-feedback";
import { useSubmitFeedback } from "../hooks/use-mentees";

const FEEDBACK_MAX = 5000;

interface SessionFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  sessionTitle?: string;
}

/**
 * Rate an attended session (1–5 stars) and/or leave a comment. The backend
 * needs at least one; the rating feeds the mentor's public average.
 */
export function SessionFeedbackDialog({
  open,
  onOpenChange,
  sessionId,
  sessionTitle,
}: SessionFeedbackDialogProps) {
  const [rating, setRating] = useState<StarValue | null>(null);
  const [feedback, setFeedback] = useState("");
  const { mutate, isPending } = useSubmitFeedback();

  const canSubmit = rating !== null || feedback.trim().length > 0;

  function reset() {
    setRating(null);
    setFeedback("");
  }

  function handleSubmit() {
    if (!canSubmit) return;
    mutate(
      { sessionId, body: buildSessionFeedbackBody({ rating, feedback }) },
      {
        onSuccess: () => {
          toast.success("Thanks for your feedback!");
          reset();
          onOpenChange(false);
        },
      },
    );
  }

  function handleClose() {
    if (!isPending) {
      reset();
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <MessageSquarePlus className="size-4 text-primary" />
            </div>
            <div>
              <DialogTitle>Rate this session</DialogTitle>
              {sessionTitle && (
                <DialogDescription className="mt-0.5 text-xs">
                  {sessionTitle}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <StarRatingInput
            name={`session-rating-${sessionId}`}
            value={rating}
            onChange={setRating}
            disabled={isPending}
          />
          <div className="space-y-2">
            <Label htmlFor="session-feedback" className="text-sm font-medium">
              Your Feedback{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id="session-feedback"
              placeholder="What was most useful? What could be better?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              maxLength={FEEDBACK_MAX}
              className="resize-none"
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Add a rating, a comment, or both. Ratings count towards your
              mentor&apos;s average.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !canSubmit}
            className="min-w-30"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
