/**
 * Activity Tab
 *
 * 📍 src/features/mentor/profile/components/tabs/activity-tab.tsx
 *
 * Recent activity feed — sessions created + tasks appraised.
 * Uses the existing useMentorActivity() hook from the tasks feature.
 */

"use client";

import { Activity, BookCheck, CalendarPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMentorActivity } from "@/features/mentor/tasks/hooks/use-mentor-tasks";
import type { ActivityItem } from "@/features/mentor/tasks/schemas";

function ActivityIcon({ type }: { type: ActivityItem["activity_type"] }) {
  if (type === "SESSION_CREATED") {
    return <CalendarPlus className="h-4 w-4 text-blue-400" />;
  }
  return <BookCheck className="h-4 w-4 text-emerald-400" />;
}

function ActivityBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    approved: "bg-emerald-500/15 text-emerald-400",
    rejected: "bg-red-500/15 text-red-400",
    SCHEDULED: "bg-emerald-500/15 text-emerald-400",
    PENDING_APPROVAL: "bg-amber-500/15 text-amber-400",
    COMPLETED: "bg-blue-500/15 text-blue-400",
  };
  return (
    <Badge
      variant="secondary"
      className={`shrink-0 text-[10px] capitalize ${colorMap[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {status.toLowerCase().replace(/_/g, " ")}
    </Badge>
  );
}

function formatRelativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function ActivityTab() {
  const { data, isLoading } = useMentorActivity({ perPage: 10 });
  const items = data?.data ?? [];

  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Activity className="h-4 w-4 text-muted-foreground" />
          Recent Activity
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-[100px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-muted-foreground">
            <Activity className="h-8 w-8 opacity-30" />
            <p className="text-sm">No activity yet.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 px-4 py-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <ActivityIcon type={item.activity_type} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  {item.description && (
                    <p className="truncate text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <ActivityBadge status={item.status} />
                  <span className="text-[10px] text-muted-foreground">
                    {formatRelativeDate(item.date)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
