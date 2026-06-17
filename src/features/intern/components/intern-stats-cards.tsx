"use client";

import { Flame, Star, Target, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternOverview, useLeaderboardMe } from "@/features/intern";

const getRankMilestone = (rank: number | string) => {
  const r = Number(rank);
  if (isNaN(r) || r <= 0) return "Actively competing in leaderboard";
  if (r === 1) return "👑 Currently at the peak!";
  if (r <= 3)
    return `🔥 ${r - 1} ${r - 1 === 1 ? "rank" : "ranks"} away from Rank 1`;
  if (r <= 10)
    return `🏆 ${r - 3} ${r - 3 === 1 ? "rank" : "ranks"} away from the Podium`;
  if (r <= 50)
    return `⚡ ${r - 10} ${r - 10 === 1 ? "rank" : "ranks"} away from the Top 10`;
  return `🚀 ${r - 50} ${r - 50 === 1 ? "rank" : "ranks"} away from the Top 50`;
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
