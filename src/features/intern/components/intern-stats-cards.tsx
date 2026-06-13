"use client";

import { Flame, Gem, Target, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserProfile } from "@/features/auth";
import { useInternOverview } from "@/features/intern";

export function InternStatsCards() {
  const { data: profile, isLoading: isProfileLoading } = useUserProfile();
  const { data: overview, isLoading: isOverviewLoading } = useInternOverview();

  const isLoading = isProfileLoading || isOverviewLoading;

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

  const userScore = overview?.score ?? profile?.karma ?? 1240;
  const userStreak = overview?.daily_streak ?? 14;
  const userGuild = overview?.guild || "DESIGN";
  const userRank = profile?.rank || 3;

  const formattedGuild = userGuild.toUpperCase().endsWith("GUILD")
    ? userGuild
    : `${userGuild} Guild`;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Points Card */}
      <Card className="relative overflow-hidden group border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:shadow-xl hover:-translate-y-1">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-brand-blue/10 rounded-full blur-3xl group-hover:bg-brand-blue/20 transition-all" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Total Gems
          </CardTitle>
          <Gem className="h-4 w-4 text-brand-blue animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black font-mono tracking-tighter text-foreground flex items-center gap-2">
            <Gem className="w-6 h-6 text-brand-blue" />
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
            {userStreak}
            <span className="text-sm font-bold text-muted-foreground uppercase">
              DAYS
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-muted overflow-hidden rounded-full p-[1px]">
            <div
              className="h-full bg-gradient-to-r from-warning to-destructive rounded-full"
              style={{ width: `${Math.min(100, (userStreak / 30) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest">
            Weekly Streak: {overview?.weekly_streak || 0} Weeks
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
          <p className="text-[10px] text-success mt-2 font-bold uppercase tracking-widest">
            Complexity score: {overview?.complexity_score || 0}
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
            {overview?.completed_tasks || 0}
            <span className="text-xs font-bold text-muted-foreground uppercase">
              COMPLETED TASKS
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-muted overflow-hidden rounded-full flex gap-1">
            {[1, 2, 3, 4, 5].map((day) => (
              <div
                key={day}
                className={`h-full flex-1 rounded-full ${
                  day <= (overview?.completed_tasks || 0)
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
