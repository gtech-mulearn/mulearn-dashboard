import type { EventDetail } from "../types";

interface EventMobileBarProps {
  event: EventDetail;
}

export function EventMobileBar({ event }: EventMobileBarProps) {
  const now = Date.now();
  const deadlineTs = event.registration_deadline
    ? new Date(event.registration_deadline).getTime()
    : null;
  const registrationClosed = deadlineTs ? deadlineTs <= now : false;

  const _startTs = new Date(event.start_datetime).getTime();
  const endTs = new Date(event.end_datetime).getTime();
  const isEnded = endTs < now;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm lg:hidden">
      <div className="flex items-center justify-between gap-4">
        {/* Left — event context */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {event.title}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {new Date(event.start_datetime).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        {/* Right — CTA */}
        {event.registration_url &&
        !registrationClosed &&
        event.viewer_can_access_registration ? (
          <a
            href={event.registration_url}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Register
          </a>
        ) : (
          <span className="shrink-0 rounded-full bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground">
            {isEnded ? "Ended" : registrationClosed ? "Closed" : "Unavailable"}
          </span>
        )}
      </div>
    </div>
  );
}
