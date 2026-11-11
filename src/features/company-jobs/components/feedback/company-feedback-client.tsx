"use client";

import {
  ExternalLink,
  HeartHandshake,
  MessageSquare,
  RefreshCw,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatShortDate } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import { useCompanyAccess } from "../../hooks/use-company-access";
import {
  useCompanyFeedbackList,
  useCompanyImpactReport,
  useImpactReportPublished,
  useSetImpactReportPublished,
} from "../../hooks/use-company-feedback";
import { useCompanyProfile } from "../../hooks/use-company-profile";
import type { FeedbackInteractionType, ImpactReport } from "../../types";

const PAGE_SIZE = 10;

const INTERACTION_LABELS: Record<FeedbackInteractionType, string> = {
  JOB: "Job application",
  TASK: "Task completion",
  EVENT: "Event attendance",
  SESSION: "Mentorship session",
};

const formatCount = (n: number) => n.toLocaleString("en-IN");
const formatRating = (n: number | null) => (n == null ? "—" : n.toFixed(1));

function StarRating({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <div
      role="img"
      aria-label={`Rated ${value} out of 5`}
      className="flex items-center gap-0.5"
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={cn(
            "h-4 w-4",
            i <= rounded
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

function StatCard({
  title,
  icon: Icon,
  value,
  caption,
  rows,
}: {
  title: string;
  icon: typeof Users;
  value: ReactNode;
  caption: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
        <dl className="mt-4 space-y-1.5 border-t pt-3 text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="font-medium text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function ImpactCards({ report }: { report: ImpactReport }) {
  const { reach, quality_signal: quality, outcome_signal: outcome } = report;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        title="Reach"
        icon={Users}
        value={formatCount(reach.total_learners_touched)}
        caption="Learners reached"
        rows={[
          { label: "Job applicants", value: formatCount(reach.job_applicants) },
          {
            label: "Task completers",
            value: formatCount(reach.task_completers),
          },
          {
            label: "Event attendees",
            value: formatCount(reach.event_attendees),
          },
          {
            label: "Session mentees",
            value: formatCount(reach.session_mentees),
          },
        ]}
      />
      <StatCard
        title="Quality"
        icon={Star}
        value={formatRating(quality.average_rating)}
        caption={
          quality.total_ratings > 0
            ? `from ${formatCount(quality.total_ratings)} ratings`
            : "No ratings yet"
        }
        rows={[
          {
            label: `Feedback (${formatCount(quality.feedback_count)})`,
            value: formatRating(quality.feedback_average_rating),
          },
          {
            label: `Mentorship sessions (${formatCount(quality.session_rating_count)})`,
            value: formatRating(quality.session_average_rating),
          },
        ]}
      />
      <StatCard
        title="Outcomes"
        icon={Trophy}
        value={formatCount(outcome.hires)}
        caption="Hires through muLearn"
        rows={[
          {
            label: "Karma distributed",
            value: formatCount(outcome.karma_distributed),
          },
        ]}
      />
    </div>
  );
}

function RetryState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-10 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" className="gap-2" onClick={onRetry}>
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}

export function CompanyFeedbackPageClient() {
  const { can } = useCompanyAccess();
  const { profile } = useCompanyProfile();
  const slug = profile?.slug;

  const report = useCompanyImpactReport();
  const published = useImpactReportPublished(
    slug,
    profile?.publish_impact_report,
  );
  const setPublished = useSetImpactReportPublished(slug);

  const [page, setPage] = useState(1);
  const feedback = useCompanyFeedbackList({ page, perPage: PAGE_SIZE });
  const rows = feedback.data?.data ?? [];
  const totalPages = feedback.data?.pagination.totalPages ?? 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
          <HeartHandshake className="h-8 w-8 text-primary" aria-hidden="true" />
          Impact & Feedback
        </h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">
          Who your company has reached on muLearn, and what learners say about
          working with you.
        </p>
      </div>

      <section aria-labelledby="impact-heading" className="space-y-4">
        <h2
          id="impact-heading"
          className="text-xl font-semibold text-foreground"
        >
          Impact report
        </h2>

        {report.isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {(["a", "b", "c"] as const).map((k) => (
              <Skeleton key={k} className="h-56 rounded-xl" />
            ))}
          </div>
        ) : report.isError || !report.data ? (
          <RetryState
            message="We couldn't load your impact report."
            onRetry={() => report.refetch()}
          />
        ) : (
          <ImpactCards report={report.data} />
        )}

        <Card>
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <Label htmlFor="publish-impact" className="text-base">
                Show on your public profile
              </Label>
              <p
                id="publish-impact-hint"
                className="max-w-xl text-sm text-muted-foreground"
              >
                {can.publishImpact
                  ? "Learners and partners will see a summary of these numbers on your company page."
                  : "Only the company owner or a co-admin can change this."}
              </p>
              {slug && (
                <Link
                  href={`/profile/${slug}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  View public profile
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              )}
            </div>
            <Switch
              id="publish-impact"
              aria-describedby="publish-impact-hint"
              checked={published ?? false}
              disabled={
                !can.publishImpact ||
                published === undefined ||
                setPublished.isPending
              }
              onCheckedChange={(next) => setPublished.mutate(next)}
            />
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="feedback-heading">
        <Card>
          <CardHeader>
            <CardTitle
              id="feedback-heading"
              className="flex items-center gap-2 text-lg"
            >
              <MessageSquare
                className="h-5 w-5 text-primary"
                aria-hidden="true"
              />
              Learner feedback
            </CardTitle>
            <CardDescription>
              Ratings learners left after applying to a job, completing a task,
              attending an event or a mentorship session with your company.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedback.isLoading ? (
              <div className="space-y-3">
                {(["a", "b", "c"] as const).map((k) => (
                  <Skeleton key={k} className="h-12 w-full" />
                ))}
              </div>
            ) : feedback.isError ? (
              <RetryState
                message="We couldn't load feedback."
                onRetry={() => feedback.refetch()}
              />
            ) : rows.length === 0 ? (
              <div className="rounded-lg border border-dashed py-12 text-center">
                <MessageSquare
                  className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50"
                  aria-hidden="true"
                />
                <h3 className="text-base font-semibold text-foreground">
                  No feedback yet
                </h3>
                <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                  Learners can rate your company after they apply to a job,
                  complete a task, attend an event or join a mentorship session.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rating</TableHead>
                        <TableHead>Comment</TableHead>
                        <TableHead>For</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell>
                            <StarRating value={f.rating} />
                          </TableCell>
                          <TableCell className="max-w-md whitespace-normal text-sm">
                            {f.comment?.trim() ? (
                              f.comment
                            ) : (
                              <span className="text-muted-foreground">
                                No comment
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {INTERACTION_LABELS[f.interaction_type]}
                          </TableCell>
                          <TableCell className="text-sm">
                            {f.submitted_by_name || "A learner"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatShortDate(f.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    perPage={PAGE_SIZE}
                    totalCount={feedback.data?.pagination.count}
                    handlePreviousClick={() =>
                      setPage((p) => Math.max(1, p - 1))
                    }
                    handleNextClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
