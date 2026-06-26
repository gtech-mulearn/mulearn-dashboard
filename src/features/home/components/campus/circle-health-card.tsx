import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CampusCircleHealthItem } from "../../schemas/home.schema";

type CircleHealthCardProps = {
  items?: CampusCircleHealthItem[];
  isLoading?: boolean;
};

type CircleHealthStatus = "active" | "slow" | "inactive";

const STATUS_STYLES: Record<CircleHealthStatus, string> = {
  active: "bg-success/15 text-success",
  slow: "bg-warning/15 text-warning",
  inactive: "bg-destructive/15 text-destructive",
};

export function CircleHealthCard({ items, isLoading }: CircleHealthCardProps) {
  return (
    <Card className="h-full rounded-2xl border bg-card shadow-sm">
      <CardHeader className="px-5 py-4">
        <div className="flex flex-row items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-success/10">
            <Activity className="size-4 text-success" />
          </div>
          <CardTitle className="text-base font-bold text-foreground">
            Circle Health
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-36 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0 max-h-[196px] overflow-y-auto pr-1">
            {(items ?? []).map((item) => (
              <div
                key={item.circle_id}
                className="flex items-center justify-between border-b border-border py-3 last:border-b-0"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {(item.circle_name || "").trim() || "Unnamed Circle"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.member_count} members · {item.sessions_per_month}{" "}
                    sessions/month
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                    STATUS_STYLES[item.status],
                  )}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
