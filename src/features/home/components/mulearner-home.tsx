"use client";

import { useUserInfo, useUserProfile } from "@/features/auth/hooks/use-session";
import { useCalendarEvents, useInterestGroupsList } from "../hooks";
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
    useCalendarEvents();

  const displayName = userInfo?.full_name?.split(" ")[0] ?? "Learner";
  const groups = interestGroups ?? [];

  return (
    <div className="space-y-5">
      {/* Row 1: Quick action strip */}
      <QuickActionRow />

      {/* Row 2+: Main content + calendar */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_296px]">
        {/* Left column */}
        <div className="space-y-5">
          <HeroCard name={displayName} />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-[3fr_2fr]">
            <LearningCirclesCard
              userInterestGroups={userProfile?.interest_groups}
            />
            <InterestGroupsCard groups={groups} isLoading={loadingGroups} />
          </div>
          <KarmaEarnersCard />
        </div>
        {/* Right column: Calendar — self-start prevents stretching to left-column height */}
        <div className="hidden self-start lg:sticky lg:top-5 lg:block">
          <EventCalendarCard
            events={calendarEvents}
            isLoading={loadingCalendar}
          />
        </div>
      </div>
    </div>
  );
}
