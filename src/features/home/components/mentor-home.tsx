"use client";

import { format } from "date-fns";
import {
  BookOpen,
  CalendarCheck2,
  Clock,
  Loader2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AvailabilitySlotPicker,
  scheduleHasOverlap,
} from "@/features/mentor/components/availability-slot-picker";
import {
  useAvailabilitySlots,
  useCreateAvailabilitySlots,
  useMentorOverview,
} from "@/features/mentor/hooks";
import { MentorOnboardingForm } from "@/features/mentor/onboarding/components/mentor-onboarding-form";
import {
  deriveOnboardingState,
  useMentorApplication,
  useMentorProfile,
} from "@/features/mentor/onboarding/hooks/use-onboarding";
import type { WeeklySchedule } from "@/features/mentor/types";
import { useDashboardCalendar, useMentorSessions } from "../hooks";
import { flattenDashboardCalendar } from "../utils";
import { EventCalendarCard } from "./event-calendar-card";
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

  const { data: mentorProfile, isLoading: profileLoading } = useMentorProfile(
    onboardingState === "rejected",
  );

  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
  } = useMentorOverview();

  const { data: scheduledSessions, isLoading: sessionsLoading } =
    useMentorSessions("SCHEDULED");
  const { data: pendingSessions } = useMentorSessions("PENDING");

  const { data: serverSchedule, isLoading: schedLoading } =
    useAvailabilitySlots();
  const { mutate: saveSchedule, isPending: isSaving } =
    useCreateAvailabilitySlots();
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const { data: calendarData, isLoading: loadingCalendar } =
    useDashboardCalendar({
      month: format(calendarMonth, "MMMM"),
      year: calendarMonth.getFullYear(),
    });

  const [localSchedule, setLocalSchedule] = useState<WeeklySchedule>([]);
  const [savedSchedule, setSavedSchedule] = useState<WeeklySchedule>([]);

  useEffect(() => {
    if (serverSchedule) {
      setLocalSchedule(serverSchedule);
      setSavedSchedule(serverSchedule);
    }
  }, [serverSchedule]);

  const isDirty = !scheduleEqual(localSchedule, savedSchedule);
  const hasOverlap = scheduleHasOverlap(localSchedule);

  // Step 1: wait for application to load
  if (appLoading || (onboardingState === "rejected" && profileLoading)) {
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
    const rejectionReason =
      application?.rejection_reason ?? application?.verification_note;
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-8">
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div>
            <p className="font-semibold">
              Your mentor application was not approved.
            </p>
            {rejectionReason && (
              <p className="mt-0.5 text-destructive/90">
                <span className="font-medium">Reason: </span>
                {rejectionReason}
              </p>
            )}
            <p className="mt-1 text-destructive/80">
              Please review your details below and resubmit your application.
            </p>
          </div>
        </div>
        <MentorOnboardingForm existing={mentorProfile} isEdit isReapply />
      </div>
    );
  }

  // Step 3: user has an application — wait for overview to confirm verification.
  // The new /mentor/overview/ endpoint no longer contains mentors/sessions/task_requests,
  // so we derive verified status from the scopes list: if any scope exists, user is verified.
  const is403 =
    overviewError instanceof Error &&
    "status" in overviewError &&
    (overviewError as { status: number }).status === 403;

  if (is403) {
    return <MentorSetupPrompt />;
  }

  // Still loading overview — show skeleton
  if (overviewLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  // If scopes is empty the mentor is not yet verified
  const isVerified = (overview?.scopes.length ?? 0) > 0;

  // Pending review: say exactly who acts next instead of a blank page.
  // (Rejected applications already returned above with the rejection banner + reapply form.)
  if (!isVerified) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Application submitted
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {application?.organization && (
              <p>
                Applying as{" "}
                <span className="font-medium text-foreground">
                  {application.organization}
                </span>
                .
              </p>
            )}
            <p>
              A platform admin reviews it next — you&apos;ll be notified once a
              decision is made. You can keep using μLearn as a learner in the
              meantime.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Map new MentorSession shape → OverviewSessionListItem shape expected by cards
  const mapToOverviewSession = (
    s: NonNullable<typeof scheduledSessions>[number],
  ) => ({
    id: s.id ?? "",
    title: s.title,
    ig_name: s.entity_name ?? null,
    mode: s.mode,
    starts_at: s.starts_at,
    ends_at: s.ends_at,
    status: s.status,
    meeting_link: null,
    participant_count: s.max_participants ?? 0,
  });

  const upcomingSessions = (scheduledSessions ?? []).map(mapToOverviewSession);
  const pendingGlobalSessions = (pendingSessions ?? []).map(
    mapToOverviewSession,
  );

  let sessionsCompleted = 0;
  let activeLearners = 0;
  let pendingReviews = 0;

  if (overview?.scopes) {
    for (const scope of overview.scopes) {
      const m = scope.metrics || {};
      sessionsCompleted += m.completed_sessions ?? 0;
      activeLearners += m.active_learners ?? m.active_ig_learners ?? 0;
      pendingReviews +=
        m.pending_task_reviews ?? m.pending_appraisals ?? m.pending_tasks ?? 0;
    }
  }

  const statCards = [
    {
      key: "active_mentees",
      label: "Active Mentees",
      value: activeLearners,
      delta: 0,
      delta_type: "neutral" as const,
      period: "all_time",
    },
    {
      key: "volunteer_hours",
      label: "Hours Mentored",
      value: mentorProfile?.hours ?? 0,
      delta: 0,
      delta_type: "neutral" as const,
      period: "all_time",
    },
    {
      key: "sessions_conducted",
      label: "Sessions Done",
      value: sessionsCompleted,
      delta: 0,
      delta_type: "neutral" as const,
      period: "all_time",
    },
    {
      key: "pending_task_approvals",
      label: "Pending Approvals",
      value: pendingReviews,
      delta: 0,
      delta_type: "neutral" as const,
      period: "all_time",
    },
  ];

  const nextSession = upcomingSessions[0] ?? null;
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
    if (hasOverlap) return; // guard: overlapping slots cannot be saved

    saveSchedule(
      { schedule: localSchedule },
      {
        onSuccess: () => {
          setSavedSchedule(localSchedule);
          toast.success("Availability updated");
        },
      },
    );
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

      <MentorStatCards
        statCards={statCards}
        isLoading={overviewLoading || sessionsLoading}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <UpcomingSessionsCard
          sessions={upcomingSessions}
          isLoading={sessionsLoading}
        />
        <SessionRequestsCard
          sessions={pendingGlobalSessions}
          isLoading={sessionsLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Task Requests */}
        <Card className="rounded-2xl border bg-card shadow-sm">
          <CardHeader className="px-5 py-4">
            <div className="flex flex-row items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-warning/10">
                <BookOpen className="size-4 text-warning" />
              </div>
              <CardTitle className="text-base font-bold text-foreground">
                Task Requests
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0">
            {overviewLoading ? (
              <Skeleton className="h-12 w-full rounded-lg" />
            ) : (
              <div className="flex gap-4 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-warning">—</p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                    Pending
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <EventCalendarCard
          events={flattenDashboardCalendar(calendarData)}
          isLoading={loadingCalendar}
          onMonthChange={setCalendarMonth}
        />
      </div>

      {/* Weekly Availability */}
      <Card
        id="weekly-availability"
        className="rounded-2xl border bg-card shadow-sm scroll-mt-20"
      >
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
                className="rounded-full px-3 text-muted-foreground cursor-pointer"
              >
                Discard
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isSaving || hasOverlap}
                title={
                  hasOverlap ? "Resolve overlapping slots to save" : undefined
                }
                className="rounded-full px-4 cursor-pointer"
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
            <div className="grid grid-cols-2 gap-2 md:grid-cols-7">
              {["sun", "mon", "tue", "wed", "thu", "fri", "sat"].map(
                (d, index) => (
                  <div
                    key={d}
                    className={`h-20 animate-pulse rounded-2xl border bg-muted ${index >= 2 ? "hidden md:block" : ""}`}
                  />
                ),
              )}
            </div>
          ) : (
            <>
              <AvailabilitySlotPicker
                value={localSchedule}
                onChange={setLocalSchedule}
                disabled={isSaving}
              />
              {hasOverlap && (
                <p className="mt-3 text-xs font-medium text-destructive">
                  Some slots overlap. Adjust the highlighted times to save.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <MyIgsCard />
    </div>
  );
}
