import { CalendarDays, Clock, MapPin } from "lucide-react";
import { formatEventDateRange, formatEventTime } from "../hooks";
import type { EventDetail } from "../types";

interface EventIdentityBarProps {
  event: EventDetail;
}

export function EventIdentityBar({ event }: EventIdentityBarProps) {
  const venueTypeLabel =
    event.venue.type === "physical"
      ? "In-Person"
      : event.venue.type === "online"
        ? "Online"
        : "Hybrid";
  const scopeLabel = event.scope
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-border bg-card px-5 py-3.5 shadow-sm">
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
        <CalendarDays className="size-3.5 text-primary" />
        {formatEventDateRange(event.start_datetime, event.end_datetime)}
      </span>

      <span className="h-3 w-px bg-border" />

      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <Clock className="size-3.5" />
        {formatEventTime(event.start_datetime)} onwards
      </span>

      <span className="h-3 w-px bg-border" />

      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPin className="size-3.5" />
        {event.venue.city ?? "Location TBA"}
      </span>

      <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
        {venueTypeLabel}
      </span>

      <span className="rounded-full bg-brand-blue/15 px-2.5 py-0.5 text-xs font-semibold text-brand-blue">
        {scopeLabel}
      </span>
    </div>
  );
}
