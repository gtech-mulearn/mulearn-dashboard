import { CalendarPlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EventListItem } from "../types";
import { EventCard } from "./event-card";

interface EventsGridProps {
  events: EventListItem[];
  isManageView?: boolean;
  onEventDeleted?: () => void;
  onEventView?: (event: EventListItem) => void;
  onCreateEvent?: () => void;
}

export function EventsGrid({
  events,
  isManageView,
  onEventDeleted,
  onEventView,
  onCreateEvent,
}: EventsGridProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-14 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <CalendarPlus2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-base font-medium text-foreground">
          {isManageView ? "No events yet" : "No matching events"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {isManageView
            ? "Create your first event to get your dashboard rolling."
            : "Try adjusting search or filters to find more events."}
        </p>
        {isManageView && onCreateEvent ? (
          <Button
            variant="default"
            className="mt-4 rounded-xl"
            onClick={onCreateEvent}
          >
            Create Event
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {events.map((event, index) => (
        <div key={event.id} style={{ animationDelay: `${index * 50}ms` }}>
          <EventCard
            event={event}
            isManageView={isManageView}
            onDelete={onEventDeleted}
            onView={onEventView}
          />
        </div>
      ))}
    </div>
  );
}
