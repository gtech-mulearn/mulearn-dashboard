"use client";

import { Check, Inbox, X } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MentorSessionPartial } from "../../schemas/home.schema";

type Props = {
  sessions: MentorSessionPartial[];
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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function SessionRequestsCard({ sessions, isLoading }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const visible = sessions.filter((s) => !dismissed.has(s.id));

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex-row items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-brand-purple/10">
            <Inbox className="size-4 text-brand-purple" />
          </div>
          <CardTitle className="text-base font-bold text-foreground">
            Session Requests
          </CardTitle>
        </div>
        {visible.length > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {visible.length}
          </span>
        )}
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No pending requests.
          </p>
        ) : (
          <div className="space-y-0">
            {visible.map((req, idx) => {
              const mentee = req.participants?.find(
                (p) => p.participant_role !== "MENTOR",
              );
              const color = avatarColor(mentee?.user_id ?? req.id);
              return (
                <div
                  key={req.id}
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
                      {req.title}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {timeAgo(req.starts_at)}
                  </span>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setDismissed((prev) => new Set([...prev, req.id]))
                      }
                      className="flex size-7 items-center justify-center rounded-full bg-success/15 text-success transition-colors hover:bg-success/25"
                      aria-label="Accept"
                    >
                      <Check className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDismissed((prev) => new Set([...prev, req.id]))
                      }
                      className="flex size-7 items-center justify-center rounded-full bg-destructive/15 text-destructive transition-colors hover:bg-destructive/25"
                      aria-label="Decline"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
