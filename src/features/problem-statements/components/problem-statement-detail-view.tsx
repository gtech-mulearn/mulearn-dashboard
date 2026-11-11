"use client";

/**
 * Problem Statement Detail View (learner full page)
 *
 * 📍 src/features/problem-statements/components/problem-statement-detail-view.tsx
 *
 * /dashboard/problem-statements/[idOrSlug]
 *  - Header: back link, provider, title, status badges, deadline, participants
 *  - Main: About (description + skills)
 *  - Side: "Your participation" card (first on mobile, sticky on desktop)
 *
 * Statements have no cover image, so there is no banner — the title block is
 * the page header.
 */

import {
  ArrowLeft,
  CalendarClock,
  Settings2,
  Share2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StateDisplay } from "@/components/ui/state-display";
import { useUserInfo } from "@/features/auth";
import { ROLES } from "@/lib/auth/roles";
import { useProblemStatementDetail } from "../hooks";
import { formatDeadline, participantCount, pluralize } from "../lib/format";
import type { ProblemStatement } from "../types/problem-statement.types";
import { ProblemStatementAboutSection } from "./problem-statement-about-section";
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

interface ProblemStatementDetailViewProps {
  idOrSlug: string;
}

function BackLink() {
  return (
    <Button
      variant="ghost"
      asChild
      className="gap-2 text-muted-foreground hover:text-foreground"
    >
      <Link href="/dashboard/problem-statements">
        <ArrowLeft className="h-4 w-4" />
        Back to Problem Statements
      </Link>
    </Button>
  );
}

export function ProblemStatementDetailView({
  idOrSlug,
}: ProblemStatementDetailViewProps) {
  const {
    data: statement,
    isLoading,
    isError,
  } = useProblemStatementDetail(idOrSlug);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-44 rounded-md" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !statement) {
    return (
      <StateDisplay
        variant="not-found"
        title="Problem statement not found"
        description="It may have been unpublished, or the link is incorrect."
        action={<BackLink />}
      />
    );
  }

  return <DetailContent statement={statement} />;
}

function DetailContent({ statement }: { statement: ProblemStatement }) {
  const { data: userInfo } = useUserInfo();
  const userRoles = (userInfo?.roles as string[]) ?? [];
  const isAdmin = userRoles.includes(ROLES.ADMIN);
  const isCompany = userRoles.includes(ROLES.COMPANY);
  const userCompanyId =
    userInfo?.company &&
    typeof userInfo.company === "object" &&
    "id" in userInfo.company
      ? (userInfo.company as { id: string }).id
      : typeof userInfo?.company === "string"
        ? userInfo.company
        : null;
  const canManage =
    isAdmin ||
    (isCompany &&
      Boolean(userCompanyId) &&
      userCompanyId === statement.company?.id);

  const { status, submissionUrl, submittedAt } =
    useParticipationState(statement);
  const participants = participantCount(statement.interaction_counts);
  const submittedCount = statement.interaction_counts?.Submitted ?? 0;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied.");
    } catch {
      toast.error("Couldn't copy the link.");
    }
  };

  return (
    <div className="space-y-6">
      <BackLink />

      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <ProblemStatementCompany
            company={statement.company}
            size="default"
            nameClassName="text-sm font-medium text-foreground"
          />
          <h1 className="text-2xl font-bold leading-tight text-foreground md:text-3xl">
            {statement.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
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
              {submittedCount > 0 && ` · ${submittedCount} submitted`}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 />
            Share
          </Button>
          {canManage && (
            <Button variant="outline" asChild>
              <Link
                href={`/dashboard/manage-problem-statements/${statement.id}`}
              >
                <Settings2 />
                Manage
              </Link>
            </Button>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <aside className="lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 lg:self-start">
          <Card className="gap-4 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Your participation</CardTitle>
              <CardDescription>
                {status === "Submitted"
                  ? "You've submitted a solution."
                  : status === "Trying"
                    ? statement.is_open
                      ? "You're working on this. Submit your solution link before the deadline."
                      : "You were working on this. Submissions are now closed."
                    : statement.is_open
                      ? "Mark it as Trying to track it, or submit your solution directly."
                      : "Submissions are closed for this problem statement."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {status === "Submitted" && submissionUrl && (
                <ProblemStatementSubmissionLink
                  url={submissionUrl}
                  submittedAt={submittedAt}
                />
              )}
              <ProblemStatementParticipation
                statement={statement}
                layout="stack"
              />
            </CardContent>
          </Card>
        </aside>

        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <ProblemStatementAboutSection
            description={statement.description}
            skills={statement.skills}
          />
        </div>
      </div>
    </div>
  );
}
