"use client";

/**
 * Quick-view modal for a problem statement in the learner feed.
 * Same header / body / footer anatomy as the jobs detail modal.
 */

import { CalendarClock, Users } from "lucide-react";
import Link from "next/link";
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
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Skeleton } from "@/components/ui/skeleton";
import { useProblemStatementDetail } from "../hooks";
import { formatDeadline, participantCount, pluralize } from "../lib/format";
import type { ProblemStatement } from "../types/problem-statement.types";
import { ProblemStatementCompany } from "./problem-statement-company";
import {
  ProblemStatementParticipation,
  ProblemStatementSubmissionLink,
  useParticipationState,
} from "./problem-statement-participation";
import {
  ProblemStatementAvailabilityBadge,
  ProblemStatementParticipationBadge,
} from "./problem-statement-status-badge";

interface ProblemStatementDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statement: ProblemStatement | null;
}

export function ProblemStatementDetailModal({
  open,
  onOpenChange,
  statement: initialStatement,
}: ProblemStatementDetailModalProps) {
  const { data: fullStatement, isLoading } = useProblemStatementDetail(
    open && initialStatement ? initialStatement.id : undefined,
  );
  const data = fullStatement ?? initialStatement;
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <ModalBody statement={data} isLoading={isLoading && !fullStatement} />
      </DialogContent>
    </Dialog>
  );
}

function ModalBody({
  statement,
  isLoading,
}: {
  statement: ProblemStatement;
  isLoading: boolean;
}) {
  const { status, submissionUrl, submittedAt } =
    useParticipationState(statement);
  const participants = participantCount(statement.interaction_counts);

  return (
    <>
      <DialogHeader className="shrink-0 border-b border-border px-6 pt-6 pb-4 text-left">
        <div className="pr-8">
          <ProblemStatementCompany company={statement.company} />
          <DialogTitle className="mt-2 text-xl leading-snug">
            {statement.title}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="flex flex-wrap items-center gap-1.5">
                <ProblemStatementAvailabilityBadge isOpen={statement.is_open} />
                <ProblemStatementParticipationBadge status={status} />
                <Badge>{statement.category}</Badge>
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarClock className="size-4" />
                {formatDeadline(statement.deadline)}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="size-4" />
                {pluralize(participants, "participant")}
              </span>
            </div>
          </DialogDescription>
        </div>
      </DialogHeader>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
        {status === "Submitted" && submissionUrl && (
          <ProblemStatementSubmissionLink
            url={submissionUrl}
            submittedAt={submittedAt}
          />
        )}

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <MarkdownRenderer
            content={statement.description}
            className="text-sm text-foreground/90"
          />
        )}

        {statement.skills.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">
              Skills you'll use
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {statement.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <DialogFooter className="shrink-0 gap-2 border-t border-border px-6 py-4 sm:justify-between">
        <Button variant="link" asChild className="px-0">
          <Link href={`/dashboard/problem-statements/${statement.id}`}>
            View Full Page
          </Link>
        </Button>
        <ProblemStatementParticipation statement={statement} layout="inline" />
      </DialogFooter>
    </>
  );
}
