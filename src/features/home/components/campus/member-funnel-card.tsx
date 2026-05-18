import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  CampusFunnelStage,
  CampusMemberFunnelData,
} from "../../schemas/home.schema";

const BAR_COLORS = ["#6366f1", "#8b5cf6", "#3b82f6", "#10b981", "#06b6d4"];

type MemberFunnelCardProps = {
  funnelData?: CampusMemberFunnelData;
  campusLabel?: string;
  isLoading?: boolean;
};

function FunnelRow({
  stage,
  maxValue,
  colorIndex,
}: {
  stage: CampusFunnelStage;
  maxValue: number;
  colorIndex: number;
}) {
  const pct = maxValue > 0 ? Math.round((stage.count / maxValue) * 100) : 0;
  const color = BAR_COLORS[colorIndex % BAR_COLORS.length];
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground">
        {stage.label}
      </span>
      <div className="flex-1 overflow-hidden rounded-full bg-muted h-2.5">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-xs font-semibold text-foreground">
        {stage.count}
      </span>
    </div>
  );
}

export function MemberFunnelCard({
  funnelData,
  campusLabel,
  isLoading,
}: MemberFunnelCardProps) {
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
            {(funnelData?.stages ?? []).map((stage, idx) => (
              <FunnelRow
                key={stage.key}
                stage={stage}
                maxValue={funnelData?.max ?? 1}
                colorIndex={idx}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
