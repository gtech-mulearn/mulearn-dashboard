import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CampusOverview } from "@/features/campus-manage/types";
import type { FunnelStage } from "../../constants/mock-campus";
import {
  MOCK_CAMPUS_FUNNEL,
  MOCK_CAMPUS_FUNNEL_MAX,
} from "../../constants/mock-campus";

type MemberFunnelCardProps = {
  overview?: CampusOverview;
  isLoading?: boolean;
};

function FunnelRow({
  stage,
  maxValue,
}: {
  stage: FunnelStage;
  maxValue: number;
}) {
  const pct = Math.round((stage.value / maxValue) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground">
        {stage.label}
      </span>
      <div className="flex-1 overflow-hidden rounded-full bg-muted h-2.5">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: stage.color }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-xs font-semibold text-foreground">
        {stage.value}
      </span>
    </div>
  );
}

export function MemberFunnelCard({
  overview,
  isLoading,
}: MemberFunnelCardProps) {
  const campusLabel = overview
    ? `${overview.collegeName} · ${new Date().toLocaleString("default", { month: "long", year: "numeric" })}`
    : "";
  return (
    <Card className="h-full rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-warning/10">
          <BarChart3 className="size-4 text-warning" />
        </div>
        <CardTitle className="text-base font-bold text-foreground">
          Member Funnel
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {campusLabel && (
          <p className="mb-4 text-[11px] text-muted-foreground">
            {campusLabel}
          </p>
        )}
        {isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-2.5 flex-1 rounded-full" />
                <Skeleton className="h-3 w-8 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {MOCK_CAMPUS_FUNNEL.map((stage) => (
              <FunnelRow
                key={stage.label}
                stage={stage}
                maxValue={MOCK_CAMPUS_FUNNEL_MAX}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
