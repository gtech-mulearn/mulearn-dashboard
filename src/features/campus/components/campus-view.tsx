"use client";

import { GraduationCap, MapPin, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCampusInfo, useWeeklyKarma } from "../hooks";
import type { CampusDashboardProps } from "../types";
import { StatsCards, WeeklyKarmaCard } from ".";

export const CampusView = ({ id }: CampusDashboardProps) => {
  const { data: info, isLoading: isInfoLoading } = useCampusInfo(id);
  const { data: weeklyData = [], isLoading: isWeeklyLoading } =
    useWeeklyKarma(id);

  if (isInfoLoading || isWeeklyLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons don't have stable IDs
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!info) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <div className="text-destructive p-4 rounded-full mb-4">
          <Zap className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold">Campus Not Found</h2>
        <p className="text-muted-foreground mt-2">
          We couldn't find any information for the campus with ID: {id}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {info.college_name}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{info.campus_zone}</span>
          </div>
          <div className="flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            <span>Level {info.campus_level}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            <span>{info.campus_code}</span>
          </div>
        </div>
      </div>
      <StatsCards info={info} />
      <WeeklyKarmaCard
        data={weeklyData.map((d) => ({
          date: d.date,
          value: d.value,
        }))}
      />
    </div>
  );
};
