"use client";

import {
  useMentorMentees,
  useMentorOverview,
  useMentorSessions,
} from "../hooks";
import { AvailabilityCard } from "./mentor/availability-card";
import { MenteeProgressCard } from "./mentor/mentee-progress-card";
import { MentorHeroCard } from "./mentor/mentor-hero-card";
import { MentorSetupPrompt } from "./mentor/mentor-setup-prompt";
import { MentorStatCards } from "./mentor/mentor-stat-cards";
import { SessionRequestsCard } from "./mentor/session-requests-card";
import { UpcomingSessionsCard } from "./mentor/upcoming-sessions-card";

export function MentorHome() {
  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
  } = useMentorOverview();
  const { data: scheduledSessions = [], isLoading: sessionsLoading } =
    useMentorSessions("SCHEDULED");
  const { data: pendingSessions = [], isLoading: pendingLoading } =
    useMentorSessions("PENDING");
  const { data: mentees = [], isLoading: menteesLoading } = useMentorMentees();

  // 403 = mentor persona not configured
  const is403 =
    overviewError instanceof Error &&
    "status" in overviewError &&
    (overviewError as { status: number }).status === 403;

  if (is403) {
    return <MentorSetupPrompt />;
  }

  return (
    <div className="space-y-5">
      <MentorHeroCard
        nextSession={scheduledSessions[0] ?? null}
        isVerified={overview?.mentor_profile.is_verified ?? false}
      />
      <MentorStatCards
        totalMentees={overview?.stats.total_mentees ?? 0}
        hoursMentored={overview?.stats.volunteer_hours ?? 0}
        sessionsConducted={overview?.stats.sessions_conducted ?? 0}
        pendingApprovals={overview?.stats.pending_task_approvals ?? 0}
        isLoading={overviewLoading}
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <UpcomingSessionsCard
          sessions={scheduledSessions}
          isLoading={sessionsLoading}
        />
        <SessionRequestsCard
          sessions={pendingSessions}
          isLoading={pendingLoading}
        />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr]">
        <MenteeProgressCard mentees={mentees} isLoading={menteesLoading} />
        <AvailabilityCard
          expertise={overview?.mentor_profile.expertise ?? []}
          isLoading={overviewLoading}
        />
      </div>
    </div>
  );
}
