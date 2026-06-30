"use client";

import { CalendarClock, ExternalLink, MapPin, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useParticipantHistory } from "../hooks/use-sessions";
import type { SessionParticipant } from "../schemas";

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: "bg-success/15 text-success",
  REQUESTED: "bg-warning/15 text-warning",
  PENDING_APPROVAL: "bg-warning/15 text-warning",
  COMPLETED: "bg-muted text-muted-foreground",
  CANCELLED: "bg-destructive/15 text-destructive",
  REJECTED: "bg-destructive/15 text-destructive",
};

function prettyStatus(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function formatRange(startIso?: string | null, endIso?: string | null): string {
  if (!startIso) return "Time TBD";
  const start = new Date(startIso);
  const dateFmt = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
  const datePart = dateFmt.format(start);
  const startTime = timeFmt.format(start);
  if (!endIso) return `${datePart} · ${startTime}`;
  return `${datePart} · ${startTime} – ${timeFmt.format(new Date(endIso))}`;
}

function InviteCard({ participant }: { participant: SessionParticipant }) {
  const status = (participant.session_status ?? "").toUpperCase();
  const mode = (participant.session_mode ?? "").toUpperCase();
  const isOnline = mode === "ONLINE" || mode === "HYBRID";
  const isOffline = mode === "OFFLINE" || mode === "HYBRID";
  const link = participant.session_meeting_link?.trim();
  const canJoinMeeting = status === "SCHEDULED" && !!link;

  return (
    <Card className="flex h-full flex-col rounded-2xl border bg-card shadow-sm">
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">
              {participant.session_title ?? "Session"}
            </p>
            {participant.session_entity_name && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary ring-1 ring-primary/20">
                {participant.session_entity_name}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {status && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  STATUS_STYLES[status] ?? "bg-muted text-muted-foreground",
                )}
              >
                {prettyStatus(status)}
              </span>
            )}
            {participant.attendance_status && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {prettyStatus(participant.attendance_status)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarClock className="size-3.5" />
            {formatRange(
              participant.session_starts_at,
              participant.session_ends_at,
            )}
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {isOnline && (
              <span className="flex items-center gap-1">
                <Video className="size-3.5" />
                Online
              </span>
            )}
            {isOffline && participant.session_venue && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {participant.session_venue}
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto pt-1">
          {canJoinMeeting ? (
            <Button
              type="button"
              size="sm"
              className="w-full"
              onClick={() => window.open(link, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink className="mr-1.5 size-4" />
              Join meeting
            </Button>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              {status === "SCHEDULED"
                ? "Meeting link will appear here once the host adds it."
                : "You'll be able to join once this session is scheduled."}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function MyInvitedSessionsList() {
  const { data, isLoading } = useParticipantHistory();
  const participants = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-muted-foreground">
        <CalendarClock className="size-8 opacity-30" />
        <p className="text-sm">No sessions yet.</p>
        <p className="text-xs">
          Sessions you join or are invited to will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {participants.map((participant) => (
        <InviteCard
          key={participant.id ?? participant.session_id}
          participant={participant}
        />
      ))}
    </div>
  );
}
