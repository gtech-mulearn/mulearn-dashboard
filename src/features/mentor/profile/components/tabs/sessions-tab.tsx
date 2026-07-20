/**
 * Sessions Tab
 *
 * 📍 src/features/mentor/profile/components/tabs/sessions-tab.tsx
 *
 * A compact read-only list of the mentor's sessions with a link
 * to the full sessions management page. Avoids rebuilding what already exists.
 */

"use client";

import { CalendarDays, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MentorSession } from "@/features/home/schemas/home.schema";

interface SessionsTabProps {
  sessions: MentorSession[] | undefined;
  isLoading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-emerald-500/15 text-emerald-400",
  PENDING_APPROVAL: "bg-amber-500/15 text-amber-400",
  COMPLETED: "bg-blue-500/15 text-blue-400",
  CANCELLED: "bg-red-500/15 text-red-400",
  REJECTED: "bg-red-500/15 text-red-400",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SessionsTab({ sessions, isLoading }: SessionsTabProps) {
  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          My Sessions
        </CardTitle>
        <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
          <Link href="/dashboard/mentor/sessions">
            Manage <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : !sessions || sessions.length === 0 ? (
          <div className="flex min-h-[100px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-muted-foreground">
            <CalendarDays className="h-8 w-8 opacity-30" />
            <p className="text-sm">No sessions yet.</p>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/mentor/sessions">Create a Session</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {sessions.slice(0, 6).map((session) => (
              <li key={session.id}>
                <Link
                  href="/dashboard/mentor/sessions"
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/30 px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {session.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.starts_at
                        ? formatDateTime(session.starts_at)
                        : "—"}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`shrink-0 text-[10px] ${STATUS_COLORS[session.status] ?? ""}`}
                  >
                    {session.status.replace("_", " ")}
                  </Badge>
                </Link>
              </li>
            ))}
            {sessions.length > 6 && (
              <li className="pt-1 text-center">
                <Link
                  href="/dashboard/mentor/sessions"
                  className="text-xs text-primary hover:underline"
                >
                  +{sessions.length - 6} more sessions →
                </Link>
              </li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
