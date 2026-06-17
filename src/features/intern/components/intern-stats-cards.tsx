"use client";

import { Flame, Star, Target, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternOverview, useLeaderboardMe } from "@/features/intern";

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

  if (isNaN(r) || r <= 0) return "Actively competing in leaderboard";

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
      "🔥 Breathing down the neck of #1!",
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

  const userScore = overview?.score ?? 0;
  const userDailyStreak = overview?.daily_streak ?? 0;
  const userWeeklyStreak = overview?.weekly_streak ?? 0;
  const userLongestDailyStreak = overview?.longest_daily_streak ?? 0;
  const userGuild = overview?.guild || "—";
  const userRank = meRank?.rank ?? "—";

  const formattedGuild = userGuild.toUpperCase().endsWith("GUILD")
    ? userGuild
    : userGuild !== "—"
      ? `${userGuild} Guild`
      : "—";

  const completedTasks = overview?.completed_tasks ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Score Card */}
      <Card className="relative overflow-hidden group border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:shadow-xl hover:-translate-y-1">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-brand-blue/10 rounded-full blur-3xl group-hover:bg-brand-blue/20 transition-all" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Score
          </CardTitle>
          <Star className="h-4 w-4 text-brand-blue animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black font-mono tracking-tighter text-foreground">
            {userScore.toLocaleString()}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest">
            Currently in <span className="text-success">{formattedGuild}</span>
          </p>
        </CardContent>
      </Card>

      {/* Streak Card */}
      <Card className="relative overflow-hidden group border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:shadow-xl hover:-translate-y-1">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-warning/10 rounded-full blur-3xl group-hover:bg-warning/20 transition-all" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Hot Streak
          </CardTitle>
          <Flame className="h-4 w-4 text-warning fill-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black font-mono tracking-tighter text-foreground flex items-baseline gap-1 flex-wrap">
            {userDailyStreak}
            <span className="text-sm font-bold text-muted-foreground uppercase">
              DAYS
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-muted overflow-hidden rounded-full p-[1px]">
            <div
              className="h-full bg-gradient-to-r from-warning to-destructive rounded-full"
              style={{
                width: `${Math.min(100, (userDailyStreak / 30) * 100)}%`,
              }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest">
            Longest Streak: {userLongestDailyStreak} Days
          </p>
        </CardContent>
      </Card>

      {/* Leaderboard Rank Card */}
      <Card className="relative overflow-hidden group border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:shadow-xl hover:-translate-y-1">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-brand-purple/10 rounded-full blur-3xl group-hover:bg-brand-purple/20 transition-all" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Global Rank
          </CardTitle>
          <Trophy className="h-4 w-4 text-brand-purple" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black font-mono tracking-tighter text-foreground">
            #{userRank}
          </div>
          <p className="text-[10px] text-brand-purple mt-2 font-bold uppercase tracking-widest">
            {getRankMilestone(userRank)}
          </p>
        </CardContent>
      </Card>

      {/* Weekly Completion Card */}
      <Card className="relative overflow-hidden group border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:shadow-xl hover:-translate-y-1">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-success/10 rounded-full blur-3xl group-hover:bg-success/20 transition-all" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Weekly Quests
          </CardTitle>
          <Target className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black font-mono tracking-tighter text-foreground flex items-baseline gap-1 flex-wrap">
            {completedTasks}
            <span className="text-xs font-bold text-muted-foreground uppercase">
              COMPLETED TASKS
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-muted overflow-hidden rounded-full flex gap-1">
            {[1, 2, 3, 4, 5].map((day) => (
              <div
                key={day}
                className={`h-full flex-1 rounded-full ${
                  day <= completedTasks
                    ? "bg-success"
                    : "bg-muted-foreground/20"
                }`}
              />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest">
            Log progress daily to keep streak
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
