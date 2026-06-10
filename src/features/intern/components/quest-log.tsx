"use client";

import { Activity, Gem } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternActivityLog } from "@/features/intern";

export function QuestLog() {
  const { data: activityLog, isLoading } = useInternActivityLog({
    page: 1,
    perPage: 10,
  });

  if (isLoading) {
    return (
      <Card className="h-full border-border/40 bg-card/40 backdrop-blur-md flex flex-col">
        <CardHeader className="pb-4 border-b border-border/20">
          <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-5 h-5 text-muted-foreground" />
            Quest Log
          </CardTitle>
          <CardDescription className="text-xs font-bold uppercase text-muted-foreground/60">
            Recent XP Gains
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 flex-1 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-12 rounded-lg" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const recentActivities = (activityLog?.data || []).map((activity) => ({
    id: activity.id,
    title: activity.task_title,
    date: new Date(activity.created_at).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    points: `+${activity.karma}`,
  }));

  return (
    <Card className="h-full border-border/40 bg-card/40 backdrop-blur-md flex flex-col">
      <CardHeader className="pb-4 border-b border-border/20">
        <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-5 h-5 text-muted-foreground" />
          Quest Log
        </CardTitle>
        <CardDescription className="text-xs font-bold uppercase text-muted-foreground/60">
          Recent XP Gains
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <div className="divide-y divide-border/20">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="p-4 hover:bg-muted/30 transition-all flex items-start justify-between gap-4 group"
            >
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {activity.title}
                </p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  {activity.date}
                </p>
              </div>
              <Badge className="font-black bg-brand-blue/10 text-brand-blue border-none rounded-lg px-2 py-1 flex items-center gap-0.5">
                <Gem className="w-3 h-3" />
                {activity.points}
              </Badge>
            </div>
          ))}
          {recentActivities.length === 0 && (
            <div className="p-8 text-center text-xs text-muted-foreground italic uppercase tracking-wider">
              No recent activity
            </div>
          )}
        </div>
      </CardContent>
      <div className="p-4 border-t border-border/20">
        <Link href="/dashboard/intern/timesheet">
          <Button
            variant="outline"
            className="w-full text-[10px] font-black uppercase tracking-[0.2em] border-border/50 hover:bg-muted"
          >
            View History
          </Button>
        </Link>
      </div>
    </Card>
  );
}
