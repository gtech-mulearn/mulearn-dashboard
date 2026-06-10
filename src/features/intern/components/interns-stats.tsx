"use client";

import { Activity, AlertTriangle, Gem, Trophy, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useManageInternsStatus } from "@/features/intern";

export function InternsStats() {
  const { data: statusData, isLoading } = useManageManageInternsStatus();

  function useManageManageInternsStatus() {
    return useManageInternsStatus();
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className="border-border/40 bg-card/40 backdrop-blur-md"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Parse stats with robust fallbacks
  const totalInterns =
    statusData?.total ?? statusData?.totalInterns ?? statusData?.TOTAL ?? 0;
  const activeCount = statusData?.ACTIVE ?? statusData?.active ?? 0;
  const atRiskCount =
    statusData?.AT_RISK ?? statusData?.atRisk ?? statusData?.at_risk ?? 0;
  const totalPoints =
    statusData?.total_points ??
    statusData?.totalPointsAwarded ??
    statusData?.points ??
    0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl border-t-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            Total Interns
          </CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black tracking-tighter tabular-nums">
            {totalInterns}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-tight">
            Registered Cohort Members
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl border-t-success/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            Active Heroes
          </CardTitle>
          <Activity className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black tracking-tighter tabular-nums text-success">
            {activeCount}
          </div>
          <p className="text-[10px] text-success font-bold mt-2 uppercase tracking-tight">
            Actively submitting quests
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl border-t-warning/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            At Risk
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black tracking-tighter tabular-nums text-warning">
            {atRiskCount}
          </div>
          <p className="text-[10px] text-warning font-bold mt-2 uppercase tracking-tight">
            Action needed soon
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl border-t-brand-blue/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            Total Points
          </CardTitle>
          <Trophy className="h-4 w-4 text-brand-blue" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black font-mono tracking-tighter tabular-nums text-brand-blue flex items-center gap-2">
            <Gem className="w-6 h-6" />
            {totalPoints.toLocaleString()}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-tight">
            Karma accumulated
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
