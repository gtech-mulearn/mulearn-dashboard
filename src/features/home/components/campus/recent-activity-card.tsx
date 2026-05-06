import { CheckCircle2, CirclePlus, UserPlus, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivityType } from "../../constants/mock-campus";
import { MOCK_RECENT_ACTIVITY } from "../../constants/mock-campus";

const TYPE_META: Record<
  ActivityType,
  { icon: typeof CheckCircle2; color: string }
> = {
  level_up: { icon: CheckCircle2, color: "text-success" },
  circle_created: { icon: CirclePlus, color: "text-primary" },
  member_joined: { icon: UserPlus, color: "text-brand-blue" },
  karma_voucher: { icon: Zap, color: "text-warning" },
};

export function RecentActivityCard() {
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
        <div className="space-y-0">
          {MOCK_RECENT_ACTIVITY.map((item) => {
            const meta = TYPE_META[item.type];
            const Icon = meta.icon;
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 border-b border-border py-3 last:border-b-0"
              >
                <Icon className={`mt-0.5 size-4 shrink-0 ${meta.color}`} />
                <p className="flex-1 text-sm text-foreground">{item.text}</p>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {item.timeAgo}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
