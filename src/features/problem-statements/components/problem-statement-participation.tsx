"use client";

/**
 * Learner participation controls for a problem statement.
 *
 * 📍 src/features/problem-statements/components/problem-statement-participation.tsx
 *
 * One implementation of the none → Trying → Submitted flow, shared by the
 * quick-view modal and the full page so both offer the same actions with
 * the same labels:
 *   none, open      → I'm Trying It · Submit Solution
 *   Trying, open    → Submit Solution · Leave
 *   Submitted, open → Update Submission · Leave
 *   closed          → Submissions Closed (or Leave, if participating)
 */

import { ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { authStore } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  useMyInteraction,
  useRemoveInteraction,
  useSetInteraction,
} from "../hooks";
import { formatDateTime } from "../lib/format";
import type {
  InteractionStatus,
  ProblemStatement,
} from "../types/problem-statement.types";
import { ProblemStatementSubmitDialog } from "./problem-statement-submit-dialog";

/** The current learner's interaction, preferring the live interaction query. */
export function useParticipationState(statement: ProblemStatement) {
  const myInteractionQuery = useMyInteraction(statement.id);
  const myInteraction = myInteractionQuery.data;
  const status: InteractionStatus | null =
    myInteraction?.status ?? statement.my_interaction ?? null;
  return {
    status,
    submissionUrl: myInteraction?.submission_url ?? null,
    submittedAt: myInteraction?.submitted_at ?? null,
    refetch: myInteractionQuery.refetch,
  };
}

export function ProblemStatementSubmissionLink({
  url,
  submittedAt,
  className,
}: {
  url: string;
  submittedAt?: string | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-muted/40 p-3",
        className,
      )}
    >
      <p className="text-xs text-muted-foreground">
        Your submission
        {submittedAt ? ` · ${formatDateTime(submittedAt)}` : ""}
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 flex items-start gap-1.5 break-all text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        <ExternalLink className="mt-0.5 size-3.5 shrink-0" />
        {url}
      </a>
    </div>
  );
}

interface ProblemStatementParticipationProps {
  statement: ProblemStatement;
  /** "stack": full-width column (page sidebar). "inline": right-aligned row (dialog footer). */
  layout: "stack" | "inline";
}

export function ProblemStatementParticipation({
  statement,
  layout,
}: ProblemStatementParticipationProps) {
  const [showSubmit, setShowSubmit] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const isAuthenticated =
    typeof window !== "undefined" ? authStore.isAuthenticated() : false;

  const { status, submissionUrl, refetch } = useParticipationState(statement);
  const setMutation = useSetInteraction(statement.id);
  const removeMutation = useRemoveInteraction(statement.id);
  const isPending = setMutation.isPending || removeMutation.isPending;
  const isOpen = statement.is_open;

  const requireAuth = () => {
    if (isAuthenticated) return true;
    toast.info("Sign in to participate in this problem statement.");
    return false;
  };

  const handleTry = async () => {
    if (!requireAuth()) return;
    try {
      await setMutation.mutateAsync({ status: "Trying" });
      toast.success("Added to your Participating list.");
    } catch {
      // error toast is owned by the mutation hook
    }
  };

  const handleOpenSubmit = () => {
    if (requireAuth()) setShowSubmit(true);
  };

  const handleLeave = async () => {
    try {
      await removeMutation.mutateAsync();
      setShowLeave(false);
      toast.success("You've left this problem statement.");
    } catch {
      // error toast is owned by the mutation hook
    }
  };

  const primary = !isOpen ? (
    status ? null : (
      <Button disabled className={layout === "stack" ? "w-full" : undefined}>
        Submissions Closed
      </Button>
    )
  ) : status === "Submitted" ? (
    <Button
      variant="outline"
      onClick={handleOpenSubmit}
      disabled={isPending}
      className={layout === "stack" ? "w-full" : undefined}
    >
      Update Submission
    </Button>
  ) : status === "Trying" ? (
    <Button
      onClick={handleOpenSubmit}
      disabled={isPending}
      className={layout === "stack" ? "w-full" : undefined}
    >
      Submit Solution
    </Button>
  ) : (
    <Button
      onClick={handleTry}
      disabled={isPending}
      className={layout === "stack" ? "w-full" : undefined}
    >
      {setMutation.isPending && <Loader2 className="animate-spin" />}
      I&apos;m Trying It
    </Button>
  );

  const secondary =
    status !== null ? (
      <Button
        variant="secondary"
        onClick={() => setShowLeave(true)}
        disabled={isPending}
        className={layout === "stack" ? "w-full" : undefined}
      >
        Leave
      </Button>
    ) : isOpen ? (
      <Button
        variant="outline"
        onClick={handleOpenSubmit}
        disabled={isPending}
        className={layout === "stack" ? "w-full" : undefined}
      >
        Submit Solution
      </Button>
    ) : null;

  return (
    <>
      <div
        className={
          layout === "stack"
            ? "flex flex-col gap-2"
            : "flex flex-wrap items-center justify-end gap-2"
        }
      >
        {layout === "stack" ? (
          <>
            {primary}
            {secondary}
          </>
        ) : (
          <>
            {secondary}
            {primary}
          </>
        )}
      </div>

      <ProblemStatementSubmitDialog
        open={showSubmit}
        onOpenChange={setShowSubmit}
        statement={statement}
        initialSubmissionUrl={submissionUrl}
        isSubmitted={status === "Submitted"}
        onSuccess={() => refetch()}
      />

      <ConfirmDialog
        open={showLeave}
        onOpenChange={setShowLeave}
        title="Leave this problem statement?"
        description="It will be removed from your Participating list, along with any solution link you submitted. You can rejoin while submissions are open."
        variant="destructive"
        confirmLabel="Leave"
        cancelLabel="Stay"
        onConfirm={handleLeave}
        isPending={removeMutation.isPending}
      />
    </>
  );
}
