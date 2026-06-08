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
import { Textarea } from "@/components/ui/textarea";
import { useSubmitFeedback } from "../hooks/use-mentees";

interface SessionFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  sessionTitle?: string;
}

export function SessionFeedbackDialog({
  open,
  onOpenChange,
  sessionId,
  sessionTitle,
}: SessionFeedbackDialogProps) {
  const [feedback, setFeedback] = useState("");
  const { mutate, isPending } = useSubmitFeedback();

  function handleSubmit() {
    mutate(
      { sessionId, feedback: feedback.trim() || null },
      {
        onSuccess: () => {
          toast.success("Feedback submitted successfully!");
          setFeedback("");
          onOpenChange(false);
        },
        onError: () => {
          toast.error("Failed to submit feedback. Please try again.");
        },
      },
    );
  }

  function handleClose() {
    if (!isPending) {
      setFeedback("");
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
              <DialogTitle>Submit Feedback</DialogTitle>
              {sessionTitle && (
                <DialogDescription className="mt-0.5 text-xs">
                  {sessionTitle}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label htmlFor="session-feedback" className="text-sm font-medium">
            Your feedback{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <Textarea
            id="session-feedback"
            placeholder="Share your thoughts about this session..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            className="resize-none"
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground">
            Your feedback helps improve future sessions.
          </p>
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
            disabled={isPending}
            className="min-w-[120px]"
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
