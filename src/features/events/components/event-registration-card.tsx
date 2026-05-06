import { CalendarDays, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EventDetail } from "../types";
import { InterestButton } from "./interest-button";

interface EventRegistrationCardProps {
  event: EventDetail;
  showInterestButton?: boolean;
}

export function EventRegistrationCard({
  event,
  showInterestButton = true,
}: EventRegistrationCardProps) {
  const now = Date.now();
  const startTs = new Date(event.start_datetime).getTime();
  const endTs = new Date(event.end_datetime).getTime();
  const deadlineTs = event.registration_deadline
    ? new Date(event.registration_deadline).getTime()
    : null;

  const isUpcoming = startTs > now;
  const isEnded = endTs < now;
  const isLive = !isUpcoming && !isEnded;
  const isCancelled = event.status === "cancelled";

  const registrationClosed = deadlineTs ? deadlineTs <= now : false;

  let daysLeft = 0;
  let pct = 0;
  if (deadlineTs && !registrationClosed) {
    const totalDuration = startTs - new Date(event.created_at).getTime();
    const timeLeft = deadlineTs - now;
    daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    pct = Math.max(0, Math.min(100, 100 - (timeLeft / totalDuration) * 100));
  }

  const minKarma = event.min_karma ?? 0;
  const eligible = event.viewer_can_access_registration || minKarma === 0;

  // Status pill component
  const statusPill = isCancelled ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
      Cancelled
    </span>
  ) : isUpcoming ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
      <CalendarDays className="size-3" /> Upcoming
    </span>
  ) : isLive ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
      <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
      Happening Now
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
      Event Ended
    </span>
  );

  // Registration CTA
  const registrationCTA = (() => {
    if (!event.registration_url) {
      return (
        <Button disabled className="w-full rounded-full">
          Registration Unavailable
        </Button>
      );
    }

    if (registrationClosed) {
      return (
        <div className="space-y-1">
          <Button disabled className="w-full rounded-full">
            Registration Closed
          </Button>
          {event.registration_deadline && (
            <p className="text-center text-[11px] text-muted-foreground">
              Closed on{" "}
              {new Date(event.registration_deadline).toLocaleDateString(
                undefined,
                { day: "numeric", month: "short", year: "numeric" },
              )}
            </p>
          )}
        </div>
      );
    }

    if (!event.viewer_can_access_registration) {
      return (
        <div className="space-y-1">
          <Button
            disabled
            className="w-full rounded-full bg-indigo-500/20 text-indigo-400"
          >
            Karma Requirement Not Met
          </Button>
          {event.viewer_access_blocked_reason && (
            <p className="text-center text-[11px] text-muted-foreground">
              {event.viewer_access_blocked_reason}
            </p>
          )}
        </div>
      );
    }

    return (
      <Button
        asChild
        className="w-full rounded-full bg-indigo-500 text-white hover:bg-indigo-600"
      >
        <a href={event.registration_url} target="_blank" rel="noreferrer">
          Register Now
        </a>
      </Button>
    );
  })();

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      {statusPill}

      {/* Deadline countdown */}
      {deadlineTs && !registrationClosed && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Registration closes
            </span>
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              {daysLeft === 0 ? "Today" : `${daysLeft}d left`}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-amber-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {registrationCTA}

      {showInterestButton && (
        <InterestButton
          eventId={event.id}
          status={event.viewer_interest_status}
          count={event.interest_count}
        />
      )}

      {/* Karma gate */}
      {minKarma > 0 && (
        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap className="size-3.5 text-amber-500" />
              Requires {minKarma.toLocaleString()} karma
            </span>
            {eligible ? (
              <span className="text-[11px] font-semibold text-success">
                ✓ Eligible
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-destructive">
                Need more karma
              </span>
            )}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                eligible ? "bg-success" : "bg-destructive",
              )}
              style={{ width: `${Math.min(eligible ? 100 : 0, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
