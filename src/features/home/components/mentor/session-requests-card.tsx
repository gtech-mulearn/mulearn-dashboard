"use client";

import { Check, Inbox, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserInfo } from "@/features/auth";
import { useAcceptSession } from "@/features/mentor/hooks/use-session-actions";
import type { OverviewSessionListItem } from "../../schemas/home.schema";
import { Button } from "@/components/ui/button";

type Props = {
  sessions: OverviewSessionListItem[];
  isLoading: boolean;
};

function avatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
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
  const { data: userInfo } = useUserInfo();
  const { mutate: accept, isPending: isAccepting } = useAcceptSession();

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
        {sessions.length > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {sessions.length}
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
        ) : sessions.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No pending requests.
          </p>
        ) : (
          <div className="space-y-0">
            {sessions.map((req) => {
              const color = avatarColor(req.id);
              return (
                <div
                  key={req.id}
                  className="flex items-center gap-3 border-b border-border py-3 last:border-b-0"
                >
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground"
                    style={{ backgroundColor: color }}
                  >
                    {initials(req.title)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {req.title}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {req.ig_name ?? (req.is_global ? "Global" : req.mode)}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {req.created_at
                      ? timeAgo(req.created_at)
                      : timeAgo(req.starts_at)}
                  </span>
                  <Button
                    type="button"
                    variant="default"
                    disabled={isAccepting}
                    onClick={() =>
                      accept({
                        sessionId: req.id,
                        userId: userInfo?.muid ?? "",
                      })
                    }
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-success/15 text-success transition-colors hover:bg-success/25 disabled:opacity-50 border-none"
                    aria-label="Accept"
                  >
                    {isAccepting ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Check className="size-3.5" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
