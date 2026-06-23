"use client";

import {
  AlertTriangle,
  CheckCircle2,
  PauseCircle,
  Shield,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { useManageInternsStatus } from "@/features/intern";

export function InternsStats() {
  const { data: statusData, isLoading } = useManageManageInternsStatus();

  function useManageManageInternsStatus() {
    return useManageInternsStatus();
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
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

  // Parse stats with robust fallbacks matching the API response
  const totalInterns =
    statusData?.total_interns ??
    statusData?.total ??
    statusData?.totalInterns ??
    statusData?.TOTAL ??
    0;
  const activeCount = statusData?.ACTIVE ?? statusData?.active ?? 0;
  const atRiskCount =
    statusData?.AT_RISK ?? statusData?.atRisk ?? statusData?.at_risk ?? 0;
  const onLeaveCount =
    statusData?.ON_LEAVE ?? statusData?.onLeave ?? statusData?.on_leave ?? 0;
  const inactiveCount = statusData?.INACTIVE ?? statusData?.inactive ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Total Interns"
        value={totalInterns}
        description="Registered Cohorts"
        accent="chart-1"
        icon={<Users className="size-5" />}
      />
      <StatCard
        title="Active"
        value={activeCount}
        description="Actively submitting"
        accent="chart-2"
        icon={<CheckCircle2 className="size-5" />}
      />
      <StatCard
        title="At Risk"
        value={atRiskCount}
        description="Action needed soon"
        accent="chart-3"
        icon={<AlertTriangle className="size-5" />}
      />
      <StatCard
        title="On Leave"
        value={onLeaveCount}
        description="Temporarily offline"
        accent="chart-4"
        icon={<PauseCircle className="size-5" />}
      />
      <StatCard
        title="Inactive"
        value={inactiveCount}
        description="Deactivated accounts"
        accent="chart-5"
        icon={<Shield className="size-5" />}
      />
    </div>
  );
}
