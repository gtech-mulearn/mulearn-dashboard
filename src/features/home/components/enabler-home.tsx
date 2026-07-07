"use client";

import { format } from "date-fns";
import { useState } from "react";
import { WeeklyKarmaCard } from "@/features/campus/components";
import {
  useCampusLeaderboard,
  useCampusOverview,
} from "@/features/campus-manage/hooks";
import { useCampusHomeSummary, useDashboardCalendar } from "../hooks";
import { flattenDashboardCalendar } from "../utils";
import { CampusStatCards } from "./campus/campus-stat-cards";
import { CircleHealthCard } from "./campus/circle-health-card";
import { MemberFunnelCard } from "./campus/member-funnel-card";
import { RecentActivityCard } from "./campus/recent-activity-card";
import { TopStudentsCard } from "./campus/top-students-card";
import { EventCalendarCard } from "./event-calendar-card";

export function EnablerHome() {
  const { data: summary, isLoading: summaryLoading } = useCampusHomeSummary();
  const { data: overview } = useCampusOverview();
  const { data: leaderboardData, isLoading: loadingLeaderboard } =
    useCampusLeaderboard({
      page: 1,
      orgId: overview?.orgId,
      search: "",
      ig: "",
      category: "",
      alumni: "all",
    });
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const { data: calendarData, isLoading: loadingCalendar } =
    useDashboardCalendar({
      month: format(calendarMonth, "MMMM"),
      year: calendarMonth.getFullYear(),
    });

  const campusLabel = summary?.campus
    ? `${summary.campus.college_name} · ${new Date().toLocaleString("default", { month: "long", year: "numeric" })}`
    : undefined;

  const weeklyKarmaData = (overview?.trend ?? []).map((p) => ({
    date: p.label,
    value: p.value,
  }));

  return (
    <div className="space-y-5">
      <CampusStatCards
        statCards={summary?.stat_cards}
        isLoading={summaryLoading}
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <MemberFunnelCard
          funnelData={summary?.member_funnel}
          campusLabel={campusLabel}
          isLoading={summaryLoading}
        />
        <EventCalendarCard
          events={flattenDashboardCalendar(calendarData)}
          isLoading={loadingCalendar}
          onMonthChange={setCalendarMonth}
        />
        <CircleHealthCard
          items={summary?.circle_health}
          isLoading={summaryLoading}
        />
      </div>

      <WeeklyKarmaCard data={weeklyKarmaData} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr]">
        <TopStudentsCard
          items={leaderboardData?.items}
          isLoading={loadingLeaderboard}
          campusName={summary?.campus.college_name ?? overview?.collegeName}
        />
        <RecentActivityCard
          items={summary?.recent_activity}
          isLoading={summaryLoading}
        />
      </div>
    </div>
  );
}
