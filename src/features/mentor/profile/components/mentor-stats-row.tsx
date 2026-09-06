/**
 * Mentor Stats Row
 *
 * 📍 src/features/mentor/profile/components/mentor-stats-row.tsx
 *
 * A row of 4 headline numbers derived from existing hooks:
 *   1. Mentoring Hours  — from mentor profile (hours field)
 *   2. Sessions Done    — count of SCHEDULED/COMPLETED sessions
 *   3. Active Learners  — approximated from pending sessions' participant slots
 *   4. Pending Reviews  — pending task requests count
 */

"use client";

import { BookCheck, CalendarCheck2, Clock, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMentorPersonalAnalytics } from "@/features/mentor/hooks/use-mentor";
import type { MentorApplication } from "@/features/mentor/onboarding/schemas";
import type { MentorOverview } from "@/features/mentor/types";

interface MentorStatsRowProps {
  mentorProfile: MentorApplication | undefined;
  overview: MentorOverview | undefined;
  isLoading: boolean;
}

interface StatCardItem {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
  suffix?: string;
}

export function MentorStatsRow({ isLoading }: MentorStatsRowProps) {
  const { data: analytics, isLoading: analyticsLoading } =
    useMentorPersonalAnalytics();

  const isDataLoading = isLoading || analyticsLoading;

  const stats: StatCardItem[] = [
    {
      label: "Sessions Completed",
      value: analytics?.sessions.completed ?? 0,
      icon: BookCheck,
      iconColor: "text-chart-2",
      bgColor: "bg-chart-2/14",
    },
    {
      label: "Upcoming Session",
      value: analytics?.sessions.upcoming ?? 0,
      icon: CalendarCheck2,
      iconColor: "text-chart-3",
      bgColor: "bg-chart-3/14",
    },
    {
      label: "Hours Mentored",
      value: analytics?.hours_contributed ?? 0,
      icon: Clock,
      iconColor: "text-chart-1",
      bgColor: "bg-chart-1/14",
      suffix: "hrs",
    },
    {
      label: "Karma",
      value: analytics?.karma_earned ?? 0,
      icon: Zap,
      iconColor: "text-chart-4",
      bgColor: "bg-chart-4/14",
    },
  ];

  if (isDataLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className="rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm"
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`rounded-xl p-2.5 ${stat.bgColor}`}>
                <Icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold tabular-nums">
                  {stat.value}
                  {stat.suffix && (
                    <span className="ml-0.5 text-sm font-normal text-muted-foreground">
                      {stat.suffix}
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
