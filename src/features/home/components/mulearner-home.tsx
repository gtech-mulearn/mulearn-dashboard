"use client";

import { useUserInfo, useUserProfile } from "@/features/auth/hooks/use-session";
import {
  useGlobalCalendarEvents,
  useInterestGroupsList,
  useLearnerHomeSummary,
} from "../hooks";
import { EventCalendarCard } from "./event-calendar-card";
import { HeroCard } from "./hero-card";
import { InterestGroupsCard } from "./interest-groups-card";
import { KarmaEarnersCard } from "./karma-earners-card";
import { LearningCirclesCard } from "./learning-circles-card";
import { QuickActionRow } from "./quick-action-row";

export function MuLearnerHome() {
  const { data: userInfo } = useUserInfo();
  const { data: userProfile } = useUserProfile();
  const { data: interestGroups, isLoading: loadingGroups } =
    useInterestGroupsList();
  const { data: calendarEvents, isLoading: loadingCalendar } =
    useGlobalCalendarEvents();
  const { data: summary } = useLearnerHomeSummary();

  const displayName = userInfo?.full_name?.split(" ")[0] ?? "Learner";
  const groups = interestGroups ?? [];

  const circleCount = summary?.quick_action_counts.circles ?? 0;
  const rank = summary?.stats.rank ?? userProfile?.rank ?? null;
  const jobCount = summary?.quick_action_counts.job_openings ?? 0;

  return (
    <div className="space-y-5">
      <QuickActionRow
        circleCount={circleCount}
        rank={rank}
        jobCount={jobCount}
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_296px]">
        <div className="space-y-5">
          <HeroCard
            name={displayName}
            karma={summary?.stats.total_karma ?? 0}
            rank={rank}
            activeCircles={circleCount}
            streakDays={summary?.stats.streak_days ?? 0}
          />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-[3fr_2fr]">
            <LearningCirclesCard
              userInterestGroups={userProfile?.interest_groups}
            />
            <InterestGroupsCard groups={groups} isLoading={loadingGroups} />
          </div>
        </div>
        {/* Right column: Calendar + Top Performers */}
        <div className="self-start lg:sticky lg:top-5 space-y-5">
          <div className="hidden lg:block">
            <EventCalendarCard
              events={calendarEvents}
              isLoading={loadingCalendar}
            />
          </div>
          <KarmaEarnersCard />
        </div>
      </div>
    </div>
  );
}
