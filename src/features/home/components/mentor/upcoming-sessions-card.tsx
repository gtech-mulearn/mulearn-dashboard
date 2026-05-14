import { CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { MentorSession } from "../../schemas/home.schema";

type Props = {
  sessions: MentorSession[];
  isLoading: boolean;
};

function avatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 60%, 50%)`;
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: new Intl.DateTimeFormat("en-IN", {
      month: "short",
      day: "numeric",
    }).format(d),
    time: new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    }).format(d),
  };
}

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: "bg-success/15 text-success",
  PENDING: "bg-warning/15 text-warning",
  CANCELLED: "bg-destructive/15 text-destructive",
  COMPLETED: "bg-muted text-muted-foreground",
};

export function UpcomingSessionsCard({ sessions, isLoading }: Props) {
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
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No upcoming sessions.
          </p>
        ) : (
          <div className="space-y-0">
            {sessions.map((session) => {
              const mentee = session.participants.find(
                (p) => p.participant_role !== "MENTOR",
              );
              const { date, time } = formatDateTime(session.starts_at);
              const color = avatarColor(mentee?.user_id ?? session.id);
              return (
                <div
                  key={session.id}
                  className="flex items-center gap-3 border-b border-border py-3 last:border-b-0"
                >
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground"
                    style={{ backgroundColor: color }}
                  >
                    {mentee ? initials(mentee.full_name) : "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {mentee?.full_name ?? "Unknown"}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {session.title}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-medium text-foreground">
                      {date}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{time}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                      STATUS_STYLES[session.status] ??
                        "bg-muted text-muted-foreground",
                    )}
                  >
                    {session.status.charAt(0) +
                      session.status.slice(1).toLowerCase()}
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
