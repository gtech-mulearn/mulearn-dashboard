"use client";

import { CalendarCheck, Star, Target, Trophy } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useInternOverview,
  useLeaderboardMe,
  useMonthlyReviewPrefill,
} from "../hooks/use-intern";
import { formatDateOnly, formatReviewMonth } from "../utils/intern-helpers";

const REVIEW_STATUS: Record<string, { label: string; className: string }> = {
  NONE: { label: "Not submitted", className: "text-warning" },
  PENDING: { label: "Pending", className: "text-warning" },
  APPROVED: { label: "Approved", className: "text-success" },
  REJECTED: { label: "Rejected", className: "text-destructive" },
};

const RANK_MILESTONE_MESSAGES = {
  peak: [
    "👑 Currently at the peak!",
    "👑 King of the hill! Can anyone dethrone you?",
    "👑 Number 1 and holding the line!",
  ],
  podium: [
    "🏆 You're closing in on the Podium!",
    "🏆 So close to the top 3, keep pushing!",
    "🏆 Chasing the podium spots!",
    "🏆 Nearly on the podium!",
  ],
  top10: [
    "⚡ Striking distance from the Top 10!",
    "⚡ Eyeing the Top 10. You've got this!",
    "⚡ Guard your spot, the Top 10 is next!",
    "⚡ Just a few more wins to crack the Top 10.",
  ],
  top50: [
    "🚀 Climbing fast toward the Top 50!",
    "🚀 On track for the Top 50.",
    "🚀 Leaving the competition behind!",
    "🚀 Pushing hard into the Top 50!",
  ],
};

const getRankMilestone = (rank: number | string) => {
  const r = Number(rank);

  if (Number.isNaN(r) || r <= 0) return "Actively competing in leaderboard";

  if (r === 1) {
    const pool = RANK_MILESTONE_MESSAGES.peak;
    return pool[r % pool.length];
  }

  if (r <= 3) {
    const steps = r - 1;
    const stepWord = steps === 1 ? "step" : "steps";
    const rank1Messages = [
      `🔥 Just ${steps} ${stepWord} away from the absolute peak!`,
      "🔥 Rank 1 is within your grasp!",
      "🔥 Next stop: The very top.",
      "🔥 Hot on the trail of #1",
    ];
    return rank1Messages[r % rank1Messages.length];
  }

  if (r <= 10) {
    const pool = RANK_MILESTONE_MESSAGES.podium;
    return pool[r % pool.length];
  }

  if (r <= 50) {
    const pool = RANK_MILESTONE_MESSAGES.top10;
    return pool[r % pool.length];
  }

  const pool = RANK_MILESTONE_MESSAGES.top50;
  return pool[r % pool.length];
};

export function InternStatsCards() {
  const { data: overview, isLoading: isOverviewLoading } = useInternOverview();
  const { data: meRank, isLoading: isMeLoading } = useLeaderboardMe();
  const { data: reviewPrefill } = useMonthlyReviewPrefill();

  const isLoading = isOverviewLoading || isMeLoading;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className="border-border/40 bg-card/50 backdrop-blur-sm"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalKarma = overview?.total_intern_karma ?? 0;
  const userGuild = overview?.guild || "—";
  const userRank = meRank?.rank ?? "—";

  const formattedGuild = userGuild.toUpperCase().endsWith("GUILD")
    ? userGuild
    : userGuild !== "—"
      ? `${userGuild} Guild`
      : "—";

  const completedTasks = overview?.completed_tasks ?? 0;

  const reviewStatus =
    REVIEW_STATUS[reviewPrefill?.existing_review?.status ?? "NONE"];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Karma Card */}
      <Card className="relative overflow-hidden group border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:shadow-xl hover:-translate-y-1">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full blur-3xl transition-all bg-chart-1/10 group-hover:bg-chart-1/20" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Total Karma
          </CardTitle>
          <Star className="h-4 w-4 text-chart-1" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black font-mono tracking-tighter text-foreground">
            {totalKarma.toLocaleString()}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest">
            Currently in <span className="text-success">{formattedGuild}</span>
          </p>
        </CardContent>
      </Card>

      {/* Leaderboard Rank Card */}
      <Card className="relative overflow-hidden group border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:shadow-xl hover:-translate-y-1">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full blur-3xl transition-all bg-chart-2/10 group-hover:bg-chart-2/20" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Global Rank
          </CardTitle>
          <Trophy className="h-4 w-4 text-chart-2" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black font-mono tracking-tighter text-foreground">
            #{userRank}
          </div>
          <p className="text-[10px] text-chart-2 mt-2 font-bold uppercase tracking-widest">
            {getRankMilestone(userRank)}
          </p>
        </CardContent>
      </Card>

      {/* Completed Tasks Card */}
      <Card className="relative overflow-hidden group border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:shadow-xl hover:-translate-y-1">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full blur-3xl transition-all bg-chart-4/10 group-hover:bg-chart-4/20" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Completed Tasks
          </CardTitle>
          <Target className="h-4 w-4 text-chart-4" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black font-mono tracking-tighter text-foreground">
            {completedTasks}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest">
            Tasks completed so far
          </p>
        </CardContent>
      </Card>

      {/* Monthly Review Card */}
      <Link href="/dashboard/intern/monthly-review" className="block">
        <Card className="h-full relative overflow-hidden group border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:shadow-xl hover:-translate-y-1">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full blur-3xl transition-all bg-chart-3/10 group-hover:bg-chart-3/20" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Monthly Review
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            {reviewPrefill ? (
              <>
                <div
                  className={`text-2xl font-black tracking-tighter ${reviewStatus.className}`}
                >
                  {reviewStatus.label}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest">
                  {formatReviewMonth(reviewPrefill)} ·{" "}
                  {reviewPrefill.window_open
                    ? `Open until ${formatDateOnly(reviewPrefill.closes_on)}`
                    : `Opens ${formatDateOnly(reviewPrefill.opens_on)}`}
                </p>
              </>
            ) : (
              <Skeleton className="h-8 w-32" />
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
