import { CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SessionStatus } from "../../constants/mock-mentor";
import { MOCK_UPCOMING_SESSIONS } from "../../constants/mock-mentor";

const STATUS_STYLES: Record<SessionStatus, string> = {
  confirmed: "bg-success/15 text-success",
  pending: "bg-warning/15 text-warning",
  cancelled: "bg-destructive/15 text-destructive",
};

export function UpcomingSessionsCard() {
  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
          <CalendarClock className="size-4 text-primary" />
        </div>
        <CardTitle className="text-base font-bold text-foreground">
          Upcoming Sessions
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        <div className="space-y-0">
          {MOCK_UPCOMING_SESSIONS.map((session) => (
            <div
              key={session.id}
              className="flex items-center gap-3 border-b border-border py-3 last:border-b-0"
            >
              {/* TODO: session.avatarColor is a per-mentee categorical color from mock data — leave as-is per design-system exception */}
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground"
                style={{ backgroundColor: session.avatarColor }}
              >
                {session.menteeInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {session.menteeName}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {session.topic}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-medium text-foreground">
                  {session.dateLabel}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {session.timeLabel}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                  STATUS_STYLES[session.status],
                )}
              >
                {session.status}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
