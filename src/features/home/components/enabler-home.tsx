"use client";

import {
  useCampusLeaderboard,
  useCampusOverview,
  useIgChapters,
} from "@/features/campus-manage/hooks";
import { useCalendarEvents } from "../hooks";
import { CampusStatCards } from "./campus/campus-stat-cards";
import { CircleHealthCard } from "./campus/circle-health-card";
import { MemberFunnelCard } from "./campus/member-funnel-card";
import { RecentActivityCard } from "./campus/recent-activity-card";
import { TopStudentsCard } from "./campus/top-students-card";
import { EventCalendarCard } from "./event-calendar-card";

export function EnablerHome() {
  const { data: overview, isLoading: loadingOverview } = useCampusOverview();
  const { data: leaderboardData, isLoading: loadingLeaderboard } =
    useCampusLeaderboard({
      page: 1,
      orgId: overview?.orgId,
      search: "",
      ig: "",
      cluster: "",
      alumni: "all",
    });
  const { data: igChapters, isLoading: loadingChapters } = useIgChapters();
  const { data: calendarEvents, isLoading: loadingCalendar } =
    useCalendarEvents();

  return (
    <div className="space-y-5">
      {/* Row 1: Stat cards */}
      <CampusStatCards overview={overview} isLoading={loadingOverview} />

      {/* Row 2: Funnel | Calendar | Circle Health */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <MemberFunnelCard overview={overview} isLoading={loadingOverview} />
        <EventCalendarCard
          events={calendarEvents}
          isLoading={loadingCalendar}
        />
        <CircleHealthCard igChapters={igChapters} isLoading={loadingChapters} />
      </div>

      {/* Row 3: Top Students | Recent Activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr]">
        <TopStudentsCard
          items={leaderboardData?.items}
          isLoading={loadingLeaderboard}
          campusName={overview?.collegeName}
        />
        <RecentActivityCard />
      </div>
    </div>
  );
}
