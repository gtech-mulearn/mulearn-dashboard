/**
 * Calendar bucket adapters
 *
 * 📍 src/features/home/utils/calendar.ts
 *
 * The calendar APIs return events/sessions grouped into
 * upcoming / ongoing / completed buckets. EventCalendarCard renders a flat
 * list of CalendarEvent, so these adapters flatten + normalize both shapes.
 */

import type {
  CalendarBuckets,
  CalendarEvent,
  CalendarEventBuckets,
  CalendarEventItem,
  CalendarSessionItem,
} from "../schemas";

const CALENDAR_EVENT_TYPES = new Set([
  "hackathon",
  "workshop",
  "meetup",
  "deadline",
  "other",
]);

function toEventType(categoryName?: string | null): CalendarEvent["type"] {
  const normalized = categoryName?.toLowerCase().trim();
  if (normalized && CALENDAR_EVENT_TYPES.has(normalized)) {
    return normalized as CalendarEvent["type"];
  }
  return "other";
}

function eventItemToCalendarEvent(item: CalendarEventItem): CalendarEvent {
  return {
    id: item.id,
    title: item.title,
    description: "",
    date: item.start,
    type: toEventType(item.category_name),
    location: item.venue_type ?? "",
    link: `/dashboard/events/${item.id}`,
  };
}

function sessionItemToCalendarEvent(item: CalendarSessionItem): CalendarEvent {
  return {
    id: item.id,
    title: item.title,
    description: item.description ?? "",
    date: item.starts_at,
    type: "meetup",
    location: item.venue ?? "",
    link: item.meeting_link ?? "",
  };
}

export function flattenEventBuckets(
  buckets?: CalendarEventBuckets | null,
): CalendarEvent[] {
  if (!buckets) return [];
  return [...buckets.upcoming, ...buckets.ongoing, ...buckets.completed].map(
    eventItemToCalendarEvent,
  );
}

export function flattenSessionBuckets(
  buckets?: CalendarBuckets | null,
): CalendarEvent[] {
  if (!buckets) return [];
  return [...buckets.upcoming, ...buckets.ongoing, ...buckets.completed].map(
    sessionItemToCalendarEvent,
  );
}
