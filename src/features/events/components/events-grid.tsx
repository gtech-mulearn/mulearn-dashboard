import { Button } from "@/components/ui/button";
import { StateDisplay } from "@/components/ui/state-display";
import type { EventListItem } from "../types";
import { EventCard } from "./event-card";

interface EventsGridProps {
  events: EventListItem[];
  isManageView?: boolean;
  onEventDeleted?: () => void;
  onEventView?: (event: EventListItem) => void;
  onCreateEvent?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function EventsGrid({
  events,
  isManageView,
  onEventDeleted,
  onEventView,
  onCreateEvent,
  emptyTitle,
  emptyDescription,
}: EventsGridProps) {
  if (events.length === 0) {
    return (
      <StateDisplay
        variant="no-results"
        className="rounded-2xl border border-dashed border-border bg-muted/40"
        title={emptyTitle ?? (isManageView ? "No events yet" : undefined)}
        description={
          emptyDescription ??
          (isManageView
            ? "Create your first event to get your dashboard rolling."
            : undefined)
        }
        action={
          isManageView && onCreateEvent ? (
            <Button
              variant="default"
              className="rounded-xl"
              onClick={onCreateEvent}
            >
              Create Event
            </Button>
          ) : null
        }
      />
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
