"use client";

import { AlertTriangle, BookOpen, CalendarCheck2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  useMentorProfile,
} from "@/features/mentor/onboarding/hooks/use-onboarding";
import { useTaskIgDropdown } from "@/features/mentor/tasks/hooks/use-mentor-tasks";
import type { WeeklySchedule } from "@/features/mentor/types";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  useIgCalendarEvents,
  useIgMentorSessionCalendar,
  useMentorOverview,
  useMentorSessions,
} from "../hooks";
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
  const { data: igRoles } = useTaskIgDropdown();
  const primaryIgId =
    overview?.scopes?.[0]?.scope_type === "ig"
      ? overview.scopes[0].scope_id
      : undefined;
  const { data: calendarEvents, isLoading: loadingCalendar } =
    useIgCalendarEvents(primaryIgId);
  const { data: sessionEvents, isLoading: loadingSessionCal } =
    useIgMentorSessionCalendar(primaryIgId);
  const mergedCalendarEvents = [
    ...(calendarEvents ?? []),
    ...(sessionEvents ?? []),
  ];

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
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-semibold">
              Your application was not approved.
            </span>
            {application?.verification_note && (
              <span className="mt-1 block text-sm">
                <span className="font-medium">Reason: </span>
                {application.verification_note}
              </span>
            )}
            <span className="mt-2 block text-sm">
              Please review your details below and resubmit your application.
            </span>
          </AlertDescription>
        </Alert>
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

  if (!isVerified) {
    return null;
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

  const statCards = [
    {
      key: "active_mentees",
      label: "Unique Mentees",
      value: 0,
      delta: 0,
      delta_type: "neutral" as const,
      period: "all_time",
    },
    {
      key: "sessions_conducted",
      label: "Sessions Done",
      value: upcomingSessions.length,
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
    const igId = igRoles?.[0]?.id;

    saveSchedule(
      { schedule: localSchedule, igId },
      {
        onSuccess: () => {
          setSavedSchedule(localSchedule);
          toast.success("Availability updated");
        },
        onError: (error) => {
          toast.error(
            getApiResponseError(error, {
              fallback: "Failed to save availability",
            }),
          );
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
          events={mergedCalendarEvents}
          isLoading={loadingCalendar || loadingSessionCal}
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
                disabled={isSaving}
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
            <AvailabilitySlotPicker
              value={localSchedule}
              onChange={setLocalSchedule}
              disabled={isSaving}
            />
          )}
        </CardContent>
      </Card>

      <MyIgsCard />
    </div>
  );
}
