"use client";

import {
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  Send,
  Share2,
  Sparkles,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Skeleton } from "@/components/ui/skeleton";
import { authStore } from "@/lib/auth";
import {
  useMyInteraction,
  useProblemStatementDetail,
  useRemoveInteraction,
  useSetInteraction,
} from "../hooks";
import type { ProblemStatement } from "../types/problem-statement.types";
import { ProblemStatementSubmitDialog } from "./problem-statement-submit-dialog";

interface ProblemStatementDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statement: ProblemStatement | null;
}

function formatDeadline(deadline: string | null): string | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  if (diff < 0) return "Deadline passed";
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Ends today";
  if (days === 1) return "1 day left";
  if (days <= 7) return `${days} days left`;
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function ProblemStatementDetailModal({
  open,
  onOpenChange,
  statement: initialStatement,
}: ProblemStatementDetailModalProps) {
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const isAuthenticated =
    typeof window !== "undefined" ? authStore.isAuthenticated() : false;

  const statementId = initialStatement?.id ?? "";

  // Fetch full detail when modal opens
  const { data: fullStatement, isLoading } = useProblemStatementDetail(
    open && statementId ? statementId : undefined,
  );

  const myInteractionQuery = useMyInteraction(
    open && statementId ? statementId : "",
  );
  const myInteraction = myInteractionQuery.data;

  const setMutation = useSetInteraction(statementId);
  const removeMutation = useRemoveInteraction(statementId);

  const data = fullStatement ?? initialStatement;
  if (!data) return null;

  const isSubmitted =
    data.my_interaction === "Submitted" ||
    myInteraction?.status === "Submitted";
  const isTrying =
    (data.my_interaction === "Trying" || myInteraction?.status === "Trying") &&
    !isSubmitted;

  const submissionUrl = myInteraction?.submission_url;
  const isOpen = data.is_open;
  const tryingCount = data.interaction_counts?.Trying ?? 0;
  const submittedCount = data.interaction_counts?.Submitted ?? 0;
  const deadlineText = formatDeadline(data.deadline);

  const handleShare = () => {
    const url = `${window.location.origin}/dashboard/problem-statements/${data.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const handleTryingToggle = async () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to try this challenge.");
      return;
    }
    if (isTrying || isSubmitted) {
      setShowWithdrawConfirm(true);
    } else {
      await setMutation.mutateAsync({ status: "Trying" });
      toast.success("You're now trying this challenge! 🚀");
    }
  };

  const handleWithdraw = async () => {
    await removeMutation.mutateAsync();
    setShowWithdrawConfirm(false);
    toast.success("Removed from your trying list.");
  };

  const isInteractionPending =
    setMutation.isPending || removeMutation.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="flex flex-col gap-0 p-0 max-w-4xl w-[94vw] sm:w-[90vw] md:max-w-4xl max-h-[88vh] overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-background shadow-2xl"
        >
          {/* ─── Pinned Sticky Header Bar ─── */}
          <div className="shrink-0 border-b border-border/80 bg-background/95 backdrop-blur-md px-6 py-5 sm:px-8">
            <div className="flex items-start justify-between gap-4">
              {/* Left: Avatar + Title & Meta */}
              <div className="flex items-start gap-4 min-w-0 flex-1">
                {/* Company Logo / Avatar */}
                {data.company?.logo ? (
                  <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-2xl border border-border/80 bg-card p-1 shadow-xs flex items-center justify-center">
                    <Image
                      src={data.company.logo}
                      alt={data.company.name || "Company"}
                      width={48}
                      height={48}
                      className="object-contain max-h-full max-w-full rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary font-bold text-lg sm:text-xl shadow-xs">
                    {(data.company?.name || "μLearn")[0]?.toUpperCase()}
                  </div>
                )}

                {/* Meta Row + Title + Tags */}
                <div className="space-y-1.5 min-w-0 flex-1 pr-2">
                  {/* Meta strip */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-muted-foreground truncate max-w-[180px]">
                      {data.company?.name || "μLearn"}
                    </span>
                    <span className="text-muted-foreground/40">•</span>
                    <Badge
                      variant="outline"
                      className="rounded-lg text-[11px] font-semibold bg-primary/5 text-primary border-primary/20 px-2 py-0.5"
                    >
                      {data.category}
                    </Badge>
                    {isOpen ? (
                      <Badge
                        variant="outline"
                        className="rounded-lg text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-2 py-0.5"
                      >
                        Open Submissions
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="rounded-lg text-[11px] font-medium bg-muted text-muted-foreground border-border px-2 py-0.5"
                      >
                        Closed
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                    {data.title}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Details and submission options for {data.title}
                  </DialogDescription>

                  {/* Sub-meta: Deadline & Learners */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-xs text-muted-foreground">
                    {deadlineText && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary/70" />
                        <span>
                          Deadline:{" "}
                          <strong className="font-semibold text-foreground">
                            {deadlineText}
                          </strong>
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-primary/70" />
                      <span>
                        <strong className="font-semibold text-foreground">
                          {tryingCount}
                        </strong>{" "}
                        {tryingCount === 1
                          ? "learner trying"
                          : "learners trying"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Actions (Share + Close) */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="rounded-xl gap-1.5 text-xs h-9 px-3 border-border/80 hover:bg-muted"
                  title="Share challenge"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </Button>

                <DialogClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Close dialog"
                    className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </DialogClose>
              </div>
            </div>
          </div>

          {/* ─── Scrollable Content Body ─── */}
          <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 space-y-6 min-h-0 bg-muted/10">
            {/* Required Skills Section */}
            {(data.skills || []).length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Required & Relevant Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-background px-3 py-1 text-xs font-medium text-foreground border border-border/80 shadow-2xs hover:border-primary/40 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Overview / Markdown Description */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" />
                Challenge Brief & Requirements
              </h4>

              {isLoading ? (
                <div className="space-y-3 py-4 rounded-2xl border border-border/80 bg-card p-6">
                  <Skeleton className="h-5 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-5/6 rounded-md" />
                  <Skeleton className="h-28 w-full rounded-xl mt-4" />
                </div>
              ) : (
                <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs">
                  <MarkdownRenderer
                    content={fullStatement?.description ?? data.description}
                    className="text-sm leading-relaxed text-foreground/90 max-w-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* ─── Pinned Sticky Footer ─── */}
          <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur-md px-6 py-4 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Left: Quick status summary */}
            <div className="flex items-center gap-2 text-xs">
              {isSubmitted ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Solution submitted ({tryingCount} trying • {submittedCount}{" "}
                  submitted)
                </span>
              ) : isTrying ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-brand-blue bg-brand-blue/10 border border-brand-blue/20 rounded-lg px-2.5 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  You're currently trying this challenge
                </span>
              ) : isOpen ? (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  Open for student submissions
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Submissions are closed for this challenge
                </span>
              )}
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {/* Full Page Link */}
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-xl text-xs h-9 px-3.5 gap-1.5 border-border/80 hover:bg-muted"
              >
                <Link href={`/dashboard/problem-statements/${data.id}`}>
                  <span>Full Page</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </Button>

              {/* Withdraw Button if currently trying or submitted */}
              {(isTrying || isSubmitted) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWithdrawConfirm(true)}
                  className="rounded-xl text-xs h-9 px-3 text-destructive hover:bg-destructive/10"
                  disabled={isInteractionPending}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Withdraw
                </Button>
              )}

              {/* Submission CTA: If submitted, allows updating link; if trying, allows submitting */}
              {isSubmitted ? (
                <Button
                  size="sm"
                  onClick={() => setShowSubmitDialog(true)}
                  disabled={!isOpen || isInteractionPending}
                  className="rounded-xl text-xs h-9 px-4 font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Update Link</span>
                </Button>
              ) : isTrying && isOpen ? (
                <Button
                  size="sm"
                  onClick={() => setShowSubmitDialog(true)}
                  disabled={isInteractionPending}
                  className="rounded-xl text-xs h-9 px-4 font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Solution</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={(!isOpen && !isTrying) || isInteractionPending}
                  onClick={handleTryingToggle}
                  className={`rounded-xl text-xs h-9 px-4 font-semibold gap-1.5 transition-all shadow-xs ${
                    isOpen
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "opacity-60 cursor-not-allowed"
                  }`}
                >
                  {isInteractionPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Zap className="h-3.5 w-3.5" />
                  )}
                  {isOpen ? "I'm Trying It" : "Closed"}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit Solution Dialog */}
      <ProblemStatementSubmitDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        statement={data}
        initialSubmissionUrl={submissionUrl}
        isSubmitted={isSubmitted}
        onSuccess={() => {
          myInteractionQuery.refetch();
        }}
      />

      <ConfirmDialog
        open={showWithdrawConfirm}
        onOpenChange={setShowWithdrawConfirm}
        title="Withdraw from Challenge?"
        description="This will remove this problem statement from your challenges and clear your submitted solution link. You can join again at any time while submissions remain open."
        variant="destructive"
        confirmLabel="Withdraw"
        cancelLabel="Keep Trying"
        onConfirm={handleWithdraw}
        isPending={removeMutation.isPending}
      />
    </>
  );
}
