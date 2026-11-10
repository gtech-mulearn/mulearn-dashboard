"use client";

/**
 * Problem Statement Solution Submission Dialog
 *
 * 📍 src/features/problem-statements/components/problem-statement-submit-dialog.tsx
 *
 *  - PUT    /api/v1/dashboard/problem-statements/<id>/submission/
 *  - DELETE /api/v1/dashboard/problem-statements/<id>/submission/
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubmitSolution, useWithdrawSubmission } from "../hooks";
import { SubmitSolutionSchema } from "../schemas/problem-statement.schema";
import type {
  ProblemStatement,
  SubmitSolutionPayload,
} from "../types/problem-statement.types";

interface ProblemStatementSubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statement: ProblemStatement;
  initialSubmissionUrl?: string | null;
  isSubmitted?: boolean;
  onSuccess?: () => void;
}

export function ProblemStatementSubmitDialog({
  open,
  onOpenChange,
  statement,
  initialSubmissionUrl,
  isSubmitted = false,
  onSuccess,
}: ProblemStatementSubmitDialogProps) {
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);

  const submitMutation = useSubmitSolution(statement.id);
  const withdrawMutation = useWithdrawSubmission(statement.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubmitSolutionPayload>({
    resolver: zodResolver(SubmitSolutionSchema),
    defaultValues: { submission_url: initialSubmissionUrl || "" },
  });

  useEffect(() => {
    if (open) reset({ submission_url: initialSubmissionUrl || "" });
  }, [open, initialSubmissionUrl, reset]);

  const onSubmit = async (values: SubmitSolutionPayload) => {
    try {
      await submitMutation.mutateAsync(values);
      toast.success(
        isSubmitted ? "Submission updated." : "Solution submitted.",
        {
          description: "The organisers can now review your work.",
        },
      );
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // error toast is owned by useSubmitSolution
    }
  };

  const handleWithdraw = async () => {
    try {
      await withdrawMutation.mutateAsync();
      toast.success("Submission withdrawn. You're back to Trying.");
      setShowWithdrawConfirm(false);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // error toast is owned by useWithdrawSubmission
    }
  };

  const isPending = submitMutation.isPending || withdrawMutation.isPending;
  const urlError = errors.submission_url?.message;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isSubmitted ? "Update Submission" : "Submit Solution"}
            </DialogTitle>
            <DialogDescription>
              Share a public link to your work for “{statement.title}”.
            </DialogDescription>
          </DialogHeader>

          <form
            id="problem-statement-submit-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-2"
          >
            <Label htmlFor="submission_url">Solution link</Label>
            <Input
              id="submission_url"
              type="url"
              inputMode="url"
              placeholder="https://github.com/you/your-project"
              aria-invalid={Boolean(urlError)}
              aria-describedby="submission_url_hint"
              disabled={isPending}
              {...register("submission_url")}
            />
            {urlError ? (
              <p className="text-xs text-destructive">{urlError}</p>
            ) : (
              <p
                id="submission_url_hint"
                className="text-xs text-muted-foreground"
              >
                A public https:// link — a GitHub repo, Figma file, live demo,
                Loom video or shared doc. You can change it until the deadline.
              </p>
            )}
          </form>

          <DialogFooter className="gap-2 sm:justify-between">
            {isSubmitted ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowWithdrawConfirm(true)}
                disabled={isPending}
              >
                Withdraw Submission
              </Button>
            ) : (
              <span />
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="problem-statement-submit-form"
                disabled={isPending}
              >
                {submitMutation.isPending && (
                  <Loader2 className="animate-spin" />
                )}
                {isSubmitted ? "Save Link" : "Submit"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showWithdrawConfirm}
        onOpenChange={setShowWithdrawConfirm}
        title="Withdraw your submission?"
        description="Your solution link will be removed and your status goes back to Trying. You can submit again before the deadline."
        confirmLabel="Withdraw"
        cancelLabel="Keep Submission"
        variant="destructive"
        onConfirm={handleWithdraw}
        isPending={withdrawMutation.isPending}
      />
    </>
  );
}
