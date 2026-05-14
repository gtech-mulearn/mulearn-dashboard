import { CheckCircle2, CirclePlus, UserPlus, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CampusRecentActivityItem } from "../../schemas/home.schema";

type Props = {
  items?: CampusRecentActivityItem[];
  isLoading?: boolean;
};

const TYPE_META: Record<string, { icon: typeof CheckCircle2; color: string }> =
  {
    level_up: { icon: CheckCircle2, color: "text-success" },
    circle_created: { icon: CirclePlus, color: "text-primary" },
    member_joined: { icon: UserPlus, color: "text-brand-blue" },
    karma_voucher: { icon: Zap, color: "text-warning" },
  };

const DEFAULT_META = { icon: Zap, color: "text-muted-foreground" };

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const hours = Math.max(0, Math.floor(diff / 3_600_000));
  if (hours === 0) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function RecentActivityCard({ items, isLoading }: Props) {
  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
          <Zap className="size-4 text-primary" />
        </div>
        <CardTitle className="text-base font-bold text-foreground">
          Recent Campus Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {isLoading ? (
          <div className="space-y-0">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-start gap-3 border-b border-border py-3 last:border-b-0"
              >
                <Skeleton className="mt-0.5 size-4 shrink-0 rounded-full" />
                <Skeleton className="h-4 flex-1 rounded" />
                <Skeleton className="h-3 w-10 shrink-0 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            {(items ?? []).map((item) => {
              const meta = TYPE_META[item.type] ?? DEFAULT_META;
              const Icon = meta.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 border-b border-border py-3 last:border-b-0"
                >
                  <Icon className={`mt-0.5 size-4 shrink-0 ${meta.color}`} />
                  <p className="flex-1 text-sm text-foreground">{item.title}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {timeAgo(item.created_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
