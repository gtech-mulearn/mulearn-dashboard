"use client";

/**
 * Problem Statement Solution Submission Dialog
 *
 * 📍 src/features/problem-statements/components/problem-statement-submit-dialog.tsx
 *
 * Connected directly to the backend solution submission endpoints:
 *  - PUT /api/v1/dashboard/problem-statements/<id>/submission/
 *  - DELETE /api/v1/dashboard/problem-statements/<id>/submission/
 *
 * Supports GitHub repositories, Figma designs, live deployments, Loom demos,
 * Google Docs / presentations, and other deliverables.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  Globe,
  Info,
  Link as LinkIcon,
  Loader2,
  Send,
  Trash2,
} from "lucide-react";
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
    setValue,
    formState: { errors },
  } = useForm<SubmitSolutionPayload>({
    resolver: zodResolver(SubmitSolutionSchema),
    defaultValues: {
      submission_url: initialSubmissionUrl || "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        submission_url: initialSubmissionUrl || "",
      });
    }
  }, [open, initialSubmissionUrl, reset]);

  const onSubmit = async (values: SubmitSolutionPayload) => {
    try {
      await submitMutation.mutateAsync(values);
      toast.success(
        isSubmitted
          ? "Solution link updated successfully! 🚀"
          : "Solution submitted successfully! 🚀",
        {
          description: "The company and organizers can now review your work.",
        },
      );
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // toast is handled by useSubmitSolution
    }
  };

  const handleWithdrawSubmission = async () => {
    try {
      await withdrawMutation.mutateAsync();
      setShowWithdrawConfirm(false);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // toast is handled by useWithdrawSubmission
    }
  };

  const isPending = submitMutation.isPending || withdrawMutation.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg rounded-3xl border border-border p-6 sm:p-7">
          <DialogHeader className="space-y-1.5 text-left">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Send className="size-3.5" />
              <span>{isSubmitted ? "Update Solution" : "Submit Solution"}</span>
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              {isSubmitted
                ? "Update Your Solution Link"
                : "Submit Your Solution"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Provide a direct public link to your project deliverables for
              &ldquo;
              <span className="font-semibold text-foreground">
                {statement.title}
              </span>
              &rdquo;.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-3">
            {/* Quick URL Input */}
            <div className="space-y-2">
              <label
                htmlFor="submission_url"
                className="text-xs font-semibold text-foreground flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <LinkIcon className="size-3.5 text-primary" />
                  <span>Public Deliverable URL</span>
                  <span className="text-destructive">*</span>
                </span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  HTTPS required
                </span>
              </label>

              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="submission_url"
                  type="url"
                  placeholder="https://github.com/... or https://figma.com/..."
                  {...register("submission_url")}
                  className={`pl-10 h-10 rounded-xl text-sm bg-background font-mono ${
                    errors.submission_url
                      ? "border-destructive ring-1 ring-destructive"
                      : ""
                  }`}
                  disabled={isPending}
                />
              </div>

              {errors.submission_url && (
                <p className="flex items-center gap-1.5 text-xs text-destructive mt-1">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{errors.submission_url.message}</span>
                </p>
              )}
            </div>

            {/* Helper Preset Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Common submission platforms
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {[
                  { label: "GitHub", prefix: "https://github.com/" },
                  { label: "Figma", prefix: "https://www.figma.com/file/" },
                  {
                    label: "Google Drive",
                    prefix: "https://drive.google.com/",
                  },
                  { label: "Loom Demo", prefix: "https://www.loom.com/share/" },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setValue("submission_url", item.prefix, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    className="rounded-lg border border-border bg-muted/40 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Info notice */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-start gap-2.5 text-xs text-muted-foreground">
              <Info className="size-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1 leading-relaxed text-[11px]">
                <p className="font-semibold text-foreground">
                  Submission Rules:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                  <li>URL must be public and start with https://</li>
                  <li>No localhost or IP addresses; use a registered domain</li>
                  <li>
                    You can replace or withdraw your link before the deadline
                  </li>
                </ul>
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-border/60">
              {isSubmitted ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWithdrawConfirm(true)}
                  disabled={isPending}
                  className="rounded-xl text-xs text-destructive hover:bg-destructive/10 gap-1.5 justify-start sm:justify-center"
                >
                  <Trash2 className="size-3.5" />
                  <span>Withdraw Solution</span>
                </Button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl font-bold text-xs gap-1.5 shadow-sm"
                >
                  {isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : isSubmitted ? (
                    <CheckCircle2 className="size-3.5" />
                  ) : (
                    <Send className="size-3.5" />
                  )}
                  <span>{isSubmitted ? "Update Link" : "Submit Solution"}</span>
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Withdraw Submission Confirmation Dialog */}
      <ConfirmDialog
        open={showWithdrawConfirm}
        onOpenChange={setShowWithdrawConfirm}
        title="Withdraw Your Solution?"
        description="This will clear your solution link and change your status back to 'Trying'. You can submit a new solution link anytime before the challenge deadline."
        confirmLabel="Withdraw Solution"
        cancelLabel="Keep Solution"
        variant="destructive"
        onConfirm={handleWithdrawSubmission}
        isPending={withdrawMutation.isPending}
      />
    </>
  );
}
