"use client";

import { Check, Inbox, X } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_SESSION_REQUESTS } from "../../constants/mock-mentor";

export function SessionRequestsCard() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const visible = MOCK_SESSION_REQUESTS.filter((r) => !dismissed.has(r.id));

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex-row items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/10">
            <Inbox className="size-4 text-purple-500" />
          </div>
          <CardTitle className="text-base font-bold text-foreground">
            Session Requests
          </CardTitle>
        </div>
        {visible.length > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {visible.length}
          </span>
        )}
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {visible.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No pending requests.
          </p>
        ) : (
          <div className="space-y-0">
            {visible.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-3 border-b border-border py-3 last:border-b-0"
              >
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: req.avatarColor }}
                >
                  {req.menteeInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {req.menteeName}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {req.muid} · {req.topic}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {req.timeAgo}
                </span>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setDismissed((prev) => new Set([...prev, req.id]))
                    }
                    className="flex size-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 transition-colors hover:bg-emerald-500/25 dark:text-emerald-400"
                    aria-label="Accept"
                  >
                    <Check className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDismissed((prev) => new Set([...prev, req.id]))
                    }
                    className="flex size-7 items-center justify-center rounded-full bg-red-500/15 text-red-600 transition-colors hover:bg-red-500/25 dark:text-red-400"
                    aria-label="Decline"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
