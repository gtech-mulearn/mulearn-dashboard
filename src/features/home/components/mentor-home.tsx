"use client";

import { useMentorHomeSummary } from "../hooks";
import { AvailabilityCard } from "./mentor/availability-card";
import { MenteeProgressCard } from "./mentor/mentee-progress-card";
import { MentorHeroCard } from "./mentor/mentor-hero-card";
import { MentorSetupPrompt } from "./mentor/mentor-setup-prompt";
import { MentorStatCards } from "./mentor/mentor-stat-cards";
import { SessionRequestsCard } from "./mentor/session-requests-card";
import { UpcomingSessionsCard } from "./mentor/upcoming-sessions-card";

export function MentorHome() {
  const { data: summary, isLoading, error } = useMentorHomeSummary();

  // 403 = mentor persona not configured
  const is403 =
    error instanceof Error &&
    "status" in error &&
    (error as { status: number }).status === 403;

  if (is403) {
    return <MentorSetupPrompt />;
  }

  return (
    <div className="space-y-5">
      <MentorHeroCard
        nextSession={summary?.next_session ?? null}
        // Verification status not exposed by home-summary endpoint; hardcoded until backend adds it
        isVerified={false}
      />
      <MentorStatCards
        statCards={summary?.stat_cards ?? []}
        isLoading={isLoading}
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <UpcomingSessionsCard
          sessions={summary?.upcoming_sessions ?? []}
          isLoading={isLoading}
        />
        <SessionRequestsCard
          sessions={summary?.session_requests ?? []}
          isLoading={isLoading}
        />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr]">
        <MenteeProgressCard
          mentees={summary?.mentee_progress ?? []}
          isLoading={isLoading}
        />
        <AvailabilityCard
          expertise={summary?.expertise_tags ?? []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
