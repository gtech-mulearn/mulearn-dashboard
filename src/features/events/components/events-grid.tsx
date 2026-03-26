import type { EventListItem } from "../types";
import { EventCard } from "./event-card";

interface EventsGridProps {
  events: EventListItem[];
  isManageView?: boolean;
  onEventDeleted?: () => void;
  onEventEdit?: (event: EventListItem) => void;
  onEventView?: (event: EventListItem) => void;
}

export function EventsGrid({
  events,
  isManageView,
  onEventDeleted,
  onEventEdit,
  onEventView,
}: EventsGridProps) {
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">
          {isManageView
            ? "Create your first event to get started"
            : "Try adjusting your filters"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          isManageView={isManageView}
          onDelete={onEventDeleted}
          onEdit={onEventEdit}
          onView={onEventView}
        />
      ))}
    </div>
  );
}
