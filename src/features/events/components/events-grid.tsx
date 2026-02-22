import type { Event } from "../types";
import { EventCard } from "./event-card";

interface EventsGridProps {
  events: Event[];
  onEventDeleted?: () => void;
  onEventEdit?: (event: Event) => void;
}

export function EventsGrid({
  events,
  onEventDeleted,
  onEventEdit,
}: EventsGridProps) {
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-muted">No events found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {events.map((event: Event) => (
        <EventCard
          key={event.id}
          event={event}
          onDelete={onEventDeleted}
          onEdit={onEventEdit}
        />
      ))}
    </div>
  );
}
