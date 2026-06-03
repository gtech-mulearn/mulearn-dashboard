"use client";

import {
  Activity,
  AlertTriangle,
  BookOpen,
  CalendarCheck2,
  Clock,
  Loader2,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AvailabilitySlotPicker } from "@/features/mentor/components/availability-slot-picker";
import {
  useAvailabilitySlots,
  useCreateAvailabilitySlots,
} from "@/features/mentor/hooks";
import { MentorOnboardingForm } from "@/features/mentor/onboarding/components/mentor-onboarding-form";
import {
  deriveOnboardingState,
  useMentorApplication,
} from "@/features/mentor/onboarding/hooks/use-onboarding";
import type { WeeklySchedule } from "@/features/mentor/types";
import { useMentorOverview } from "../hooks";
import type {
  MentorOverview,
  OverviewActivityItem,
} from "../schemas/home.schema";
import { MentorHeroCard } from "./mentor/mentor-hero-card";
import { MentorSetupPrompt } from "./mentor/mentor-setup-prompt";
import { MentorStatCards } from "./mentor/mentor-stat-cards";
import { MyIgsCard } from "./mentor/my-igs-card";
import { SessionRequestsCard } from "./mentor/session-requests-card";
import { UpcomingSessionsCard } from "./mentor/upcoming-sessions-card";

function scheduleEqual(a: WeeklySchedule, b: WeeklySchedule): boolean {
  return (
    JSON.stringify([...a].sort((x, y) => x.day - y.day)) ===
    JSON.stringify([...b].sort((x, y) => x.day - y.day))
  );
}

function isSelfMentors(
  m: MentorOverview["mentors"],
): m is { is_verified: boolean; mentor_tier: string | null; hours: number } {
  return "is_verified" in m;
}

const ACTION_LABELS: Record<string, string> = {
  SESSION_CREATE: "Created session",
  SESSION_UPDATE: "Updated session",
  SESSION_CANCEL: "Cancelled session",
  SESSION_COMPLETE: "Completed session",
  OPPORTUNITY_POST: "Posted opportunity",
  OPPORTUNITY_UPDATE: "Updated opportunity",
  TASK_REQUEST_CREATE: "Submitted task request",
  TASK_REQUEST_UPDATE: "Updated task request",
};

function activityLabel(item: OverviewActivityItem): string {
  const verb = ACTION_LABELS[item.action_type] ?? item.action_type;
  const title =
    typeof item.new_data?.title === "string" ? ` "${item.new_data.title}"` : "";
  const ig = item.ig_name ? ` · ${item.ig_name}` : "";
  return `${verb}${title}${ig}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function MentorHome() {
  const {
    data: application,
    isLoading: appLoading,
    error: appError,
  } = useMentorApplication();

  const onboardingState = deriveOnboardingState(
    application,
    appError as Error | null,
  );

  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
  } = useMentorOverview();

  const { data: serverSchedule, isLoading: schedLoading } =
    useAvailabilitySlots();
  const { mutate: saveSchedule, isPending: isSaving } =
    useCreateAvailabilitySlots();

  const [localSchedule, setLocalSchedule] = useState<WeeklySchedule>([]);
  const [savedSchedule, setSavedSchedule] = useState<WeeklySchedule>([]);

  useEffect(() => {
    if (serverSchedule) {
      setLocalSchedule(serverSchedule);
      setSavedSchedule(serverSchedule);
    }
  }, [serverSchedule]);

  const isDirty = !scheduleEqual(localSchedule, savedSchedule);

  // Step 1: wait for application to load
  if (appLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  // Step 2: handle terminal application states (no overview needed)
  if (onboardingState === "not_applied") {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <MentorOnboardingForm />
      </div>
    );
  }

  if (onboardingState === "rejected") {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your application was not approved.
            {application?.verification_note && (
              <span className="mt-1 block font-medium">
                {application.verification_note}
              </span>
            )}
          </AlertDescription>
        </Alert>
        {/* Cast to unknown to allow passing partial data to form for editing */}
        <MentorOnboardingForm
          existing={
            application as unknown as import("@/features/mentor/onboarding/schemas").MentorApplication
          }
          isEdit
        />
      </div>
    );
  }

  // Step 3: user has an application — wait for overview to confirm verification
  const selfMentors =
    overview && isSelfMentors(overview.mentors) ? overview.mentors : null;
  const isVerified = selfMentors?.is_verified ?? false;

  const is403 =
    overviewError instanceof Error &&
    "status" in overviewError &&
    (overviewError as { status: number }).status === 403;

  if (is403) {
    return <MentorSetupPrompt />;
  }

  // Still loading overview — don't flash the banner, show skeleton
  if (overviewLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  // Overview loaded and is_verified is false → show pending banner
  if (!isVerified) {
    return (
      <div className="space-y-6">
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Your mentor application is under review. You will be notified once
            approved.
          </AlertDescription>
        </Alert>
        <Card>
          <CardHeader>
            <CardTitle>Your Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Show any text the user may have provided; status obj may not have about */}
            {!!(application as Record<string, unknown>)?.about && (
              <p className="text-sm text-muted-foreground">
                {(application as Record<string, unknown>).about as string}
              </p>
            )}
            {!!(application as Record<string, unknown>)?.expertise && (
              <p className="text-sm text-foreground">
                {(application as Record<string, unknown>).expertise as string}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Build derived data from overview ──────────────────────────────────────

  const sessionCounts = overview?.sessions.counts;
  const taskRequests = overview?.task_requests;
  const opportunities = overview?.opportunities;

  const statCards = [
    {
      key: "active_mentees",
      label: "Unique Mentees",
      value: overview?.mentees.total_unique ?? 0,
      delta: 0,
      delta_type: "neutral" as const,
      period: "all_time",
    },
    {
      key: "volunteer_hours",
      label: "Hours Mentored",
      value: selfMentors?.hours ?? 0,
      delta: 0,
      delta_type: "neutral" as const,
      period: "all_time",
    },
    {
      key: "sessions_conducted",
      label: "Sessions Done",
      value: sessionCounts?.completed ?? 0,
      delta: 0,
      delta_type: "neutral" as const,
      period: "all_time",
    },
    {
      key: "pending_task_approvals",
      label: "Pending Approvals",
      value: taskRequests?.pending ?? 0,
      delta: 0,
      delta_type: "neutral" as const,
      period: "all_time",
    },
  ];

  const nextSession = overview?.sessions.upcoming[0] ?? null;
  const nextSessionForHero = nextSession
    ? {
        id: nextSession.id,
        title: nextSession.title,
        mentee_name: "",
        mentee_muid: "",
        starts_at: nextSession.starts_at,
        mode: nextSession.mode ?? "",
        meeting_link: nextSession.meeting_link ?? null,
      }
    : null;

  function handleSave() {
    saveSchedule(localSchedule, {
      onSuccess: () => {
        setSavedSchedule(localSchedule);
        toast.success("Availability updated");
      },
      onError: (error) => {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Failed to save availability",
        );
      },
    });
  }

  function handleDiscard() {
    setLocalSchedule(savedSchedule);
  }

  return (
    <div className="space-y-5">
      <MentorHeroCard
        nextSession={nextSessionForHero}
        isVerified={isVerified}
      />

      <MentorStatCards statCards={statCards} isLoading={overviewLoading} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <UpcomingSessionsCard
          sessions={overview?.sessions.upcoming ?? []}
          isLoading={overviewLoading}
        />
        <SessionRequestsCard
          sessions={overview?.sessions.pending_global ?? []}
          isLoading={overviewLoading}
        />
      </div>

      {/* Task Requests + Opportunities summary row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Task Requests */}
        <Card className="rounded-2xl border bg-card shadow-sm">
          <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
            <div className="flex size-9 items-center justify-center rounded-xl bg-warning/10">
              <BookOpen className="size-4 text-warning" />
            </div>
            <CardTitle className="text-base font-bold text-foreground">
              Task Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0">
            {overviewLoading ? (
              <Skeleton className="h-12 w-full rounded-lg" />
            ) : (
              <div className="flex gap-4 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-warning">
                    {taskRequests?.pending ?? 0}
                  </p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                    Pending
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">
                    {taskRequests?.approved ?? 0}
                  </p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                    Approved
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-destructive">
                    {taskRequests?.rejected ?? 0}
                  </p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                    Rejected
                  </p>
                </div>
              </div>
            )}
            {!overviewLoading &&
              (taskRequests?.recent_pending.length ?? 0) > 0 && (
                <div className="mt-3 space-y-1.5 border-t pt-3">
                  {taskRequests?.recent_pending.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <p className="truncate text-xs font-medium text-foreground">
                        {t.title}
                      </p>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {t.karma ?? "—"} karma
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>

        {/* Opportunities */}
        <Card className="rounded-2xl border bg-card shadow-sm">
          <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <Target className="size-4 text-primary" />
            </div>
            <CardTitle className="text-base font-bold text-foreground">
              Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0">
            {overviewLoading ? (
              <Skeleton className="h-12 w-full rounded-lg" />
            ) : (
              <div className="flex gap-4 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">
                    {opportunities?.published ?? 0}
                  </p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                    Live
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-muted-foreground">
                    {opportunities?.draft ?? 0}
                  </p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                    Draft
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {opportunities?.total ?? 0}
                  </p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                    Total
                  </p>
                </div>
              </div>
            )}
            {!overviewLoading && (opportunities?.by_ig.length ?? 0) > 0 && (
              <div className="mt-3 space-y-1.5 border-t pt-3">
                {opportunities?.by_ig.slice(0, 3).map((ig) => (
                  <div
                    key={ig.ig_id ?? ig.ig_name}
                    className="flex items-center justify-between gap-2"
                  >
                    <p className="truncate text-xs text-muted-foreground">
                      {ig.ig_name}
                    </p>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {ig.count}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Availability */}
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader className="flex-row items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <CalendarCheck2 className="size-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Weekly Availability
              </CardTitle>
              <p className="text-[11px] text-muted-foreground">
                Set the hours you&apos;re open for sessions each week
              </p>
            </div>
          </div>
          {isDirty && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDiscard}
                disabled={isSaving}
                className="rounded-full px-3 text-muted-foreground"
              >
                Discard
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-full px-4"
              >
                {isSaving && (
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                )}
                Save changes
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          {schedLoading ? (
            <div className="grid min-w-145 grid-cols-7 gap-2">
              {["sun", "mon", "tue", "wed", "thu", "fri", "sat"].map((d) => (
                <div
                  key={d}
                  className="h-20 animate-pulse rounded-2xl border bg-muted"
                />
              ))}
            </div>
          ) : (
            <AvailabilitySlotPicker
              value={localSchedule}
              onChange={setLocalSchedule}
              disabled={isSaving}
            />
          )}
        </CardContent>
      </Card>

      <MyIgsCard />

      {/* Recent Activity */}
      {(overview?.recent_activity.length ?? 0) > 0 && (
        <Card className="rounded-2xl border bg-card shadow-sm">
          <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
            <div className="flex size-9 items-center justify-center rounded-xl bg-muted">
              <Activity className="size-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-base font-bold text-foreground">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0">
            <div className="space-y-0">
              {overview?.recent_activity.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 border-b border-border py-3 last:border-b-0"
                >
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Activity className="size-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">
                      {activityLabel(item)}
                    </p>
                    {item.actor_name && (
                      <p className="text-[11px] text-muted-foreground">
                        by {item.actor_name}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {timeAgo(item.created_at)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
