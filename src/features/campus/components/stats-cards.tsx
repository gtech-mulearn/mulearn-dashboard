"use client";

import { Activity, Trophy, Users, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CampusInfo, StatCardProps } from "../types";

const StatCard = ({
  title,
  value,
  description,
  icon,
  className,
}: StatCardProps) => (
  <Card className={`hover:shadow-md transition-shadow ${className}`}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export const StatsCards = ({ info }: { info: CampusInfo }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Karma"
        value={info.total_karma.toLocaleString()}
        description="Accumulated over time"
        icon={<Zap className="h-4 w-4 text-chart-4 fill-chart-4/20" />}
      />
      <StatCard
        title="Rank"
        value={`#${info.rank}`}
        description="among all campuses"
        icon={<Trophy className="h-4 w-4 text-primary fill-primary/20" />}
      />
      <StatCard
        title="Total Members"
        value={info.total_members}
        description="Registered on µLearn"
        icon={<Users className="h-4 w-4 text-chart-2 fill-chart-2/20" />}
      />
      <StatCard
        title="Active Members"
        value={info.active_members}
        description="Active in last 30 days"
        icon={<Activity className="h-4 w-4 text-destructive" />}
      />
    </div>
  );
};
