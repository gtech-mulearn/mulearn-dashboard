"use client";

import { CalendarCheck2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MenteeProgressCard } from "@/features/home/components/mentor/mentee-progress-card";
import { MentorHeroCard } from "@/features/home/components/mentor/mentor-hero-card";
import { MentorSetupPrompt } from "@/features/home/components/mentor/mentor-setup-prompt";
import { MentorStatCards } from "@/features/home/components/mentor/mentor-stat-cards";
import { SessionRequestsCard } from "@/features/home/components/mentor/session-requests-card";
import { UpcomingSessionsCard } from "@/features/home/components/mentor/upcoming-sessions-card";
import { useMentorHomeSummary } from "@/features/home/hooks";
import { useAvailabilitySlots, useCreateAvailabilitySlots } from "../hooks";
import type { WeeklySchedule } from "../types";
import { AvailabilitySlotPicker } from "./availability-slot-picker";

function scheduleEqual(a: WeeklySchedule, b: WeeklySchedule): boolean {
  return (
    JSON.stringify([...a].sort((x, y) => x.day - y.day)) ===
    JSON.stringify([...b].sort((x, y) => x.day - y.day))
  );
}

export function MentorDashboard() {
  const {
    data: summary,
    isLoading: homePending,
    error: homeError,
  } = useMentorHomeSummary();
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

  const is403 =
    homeError instanceof Error &&
    "status" in homeError &&
    (homeError as { status: number }).status === 403;

  if (is403) {
    return <MentorSetupPrompt />;
  }

  function handleSave() {
    saveSchedule(localSchedule, {
      onSuccess: () => {
        setSavedSchedule(localSchedule);
        toast.success("Availability updated");
      },
      onError: () => {
        toast.error("Failed to save availability");
      },
    });
  }

  function handleDiscard() {
    setLocalSchedule(savedSchedule);
  }

  return (
    <div className="space-y-5">
      {/* Hero */}
      <MentorHeroCard
        nextSession={summary?.next_session ?? null}
        isVerified={false}
      />

      {/* Stats */}
      <MentorStatCards
        statCards={summary?.stat_cards ?? []}
        isLoading={homePending}
      />

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
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton only
                  key={i}
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

      {/* Sessions & Requests */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <UpcomingSessionsCard
          sessions={summary?.upcoming_sessions ?? []}
          isLoading={homePending}
        />
        <SessionRequestsCard
          sessions={summary?.session_requests ?? []}
          isLoading={homePending}
        />
      </div>

      {/* Mentee progress */}
      <MenteeProgressCard
        mentees={summary?.mentee_progress ?? []}
        isLoading={homePending}
      />
    </div>
  );
}
