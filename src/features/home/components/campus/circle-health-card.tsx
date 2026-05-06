import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { IgChapter } from "@/features/campus-manage/types";
import { cn } from "@/lib/utils";
import type {
  CircleHealthItem,
  CircleHealthStatus,
} from "../../constants/mock-campus";
import { MOCK_CIRCLE_HEALTH } from "../../constants/mock-campus";

type CircleHealthCardProps = {
  igChapters?: IgChapter[];
  isLoading?: boolean;
};

const STATUS_STYLES: Record<CircleHealthStatus, string> = {
  active: "bg-success/15 text-success",
  slow: "bg-warning/15 text-warning",
  inactive: "bg-destructive/15 text-destructive",
};

function mergeWithIgChapters(
  mock: CircleHealthItem[],
  chapters?: IgChapter[],
): CircleHealthItem[] {
  if (!chapters || chapters.length === 0) return mock;
  return mock.map((item, i) => {
    const chapter = chapters[i];
    if (!chapter) return item;
    return { ...item, name: chapter.name, memberCount: chapter.membersCount };
  });
}

export function CircleHealthCard({
  igChapters,
  isLoading,
}: CircleHealthCardProps) {
  const items = mergeWithIgChapters(MOCK_CIRCLE_HEALTH, igChapters);

  return (
    <Card className="h-full rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-success/10">
          <Activity className="size-4 text-success" />
        </div>
        <CardTitle className="text-base font-bold text-foreground">
          Circle Health
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
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
          <div className="space-y-0">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b border-border py-3 last:border-b-0"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.memberCount} members · {item.sessionsPerMonth}{" "}
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
