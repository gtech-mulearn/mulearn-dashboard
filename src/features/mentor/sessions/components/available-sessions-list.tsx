"use client";

import {
  CalendarClock,
  Check,
  ExternalLink,
  LogIn,
  MapPin,
  Users,
  Video,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAvailableSessions,
  useJoinSession,
  useParticipantHistory,
} from "../hooks/use-sessions";
import type { Session } from "../schemas";

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

function SessionCard({
  session,
  alreadyJoined,
}: {
  session: Session;
  alreadyJoined: boolean;
}) {
  const { mutate: join, isPending } = useJoinSession();
  const [justJoined, setJustJoined] = useState(false);
  const joined = alreadyJoined || justJoined;

  const mode = (session.mode ?? "").toUpperCase();
  const isOnline = mode === "ONLINE" || mode === "HYBRID";
  const isOffline = mode === "OFFLINE" || mode === "HYBRID";
  const meetingLink = session.meeting_link?.trim();

  return (
    <Card className="flex h-full flex-col rounded-2xl border bg-card shadow-sm">
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">{session.title}</p>
            {session.entity_name && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary ring-1 ring-primary/20">
                {session.entity_name}
              </span>
            )}
          </div>
          {session.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {session.description}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarClock className="size-3.5" />
            {formatRange(session.starts_at, session.ends_at)}
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {isOnline && (
              <span className="flex items-center gap-1">
                <Video className="size-3.5" />
                Online
              </span>
            )}
            {isOffline && session.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {session.venue}
              </span>
            )}
            {session.max_participants ? (
              <span className="flex items-center gap-1">
                <Users className="size-3.5" />
                {session.max_participants} seats
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-auto flex items-center gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            className="flex-1"
            disabled={isPending || joined}
            onClick={() =>
              join(session.id, { onSuccess: () => setJustJoined(true) })
            }
          >
            {joined ? (
              <>
                <Check className="mr-1.5 size-4" />
                Joined
              </>
            ) : (
              <>
                <LogIn className="mr-1.5 size-4" />
                {isPending ? "Joining…" : "Join"}
              </>
            )}
          </Button>
          {meetingLink && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={() =>
                window.open(meetingLink, "_blank", "noopener,noreferrer")
              }
            >
              <ExternalLink className="mr-1.5 size-4" />
              Meeting link
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AvailableSessionsList() {
  const { data, isLoading } = useAvailableSessions();
  const { data: history } = useParticipantHistory();
  const sessions = data?.data ?? [];

  // Sessions the student is already a participant of (joined or invited) so the
  // card reflects "Joined" across reloads, not just within this render.
  const joinedIds = new Set(
    (history?.data ?? [])
      .map((p) => p.session_id)
      .filter((id): id is string => Boolean(id)),
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-muted-foreground">
        <CalendarClock className="size-8 opacity-30" />
        <p className="text-sm">No sessions available to join right now.</p>
        <p className="text-xs">
          Scheduled sessions from your Interest Groups will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          alreadyJoined={joinedIds.has(session.id)}
        />
      ))}
    </div>
  );
}
