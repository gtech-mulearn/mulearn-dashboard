/**
 * Dashboard calendar adapter
 *
 * 📍 src/features/home/utils/calendar.ts
 *
 * The unified dashboard calendar API returns events/sessions grouped into
 * upcoming / ongoing / completed buckets. EventCalendarCard renders a flat
 * list of CalendarEvent, so this adapter flattens + normalizes both shapes.
 */

import type {
  CalendarEvent,
  DashboardCalendarBuckets,
  DashboardCalendarEventItem,
  DashboardCalendarSessionItem,
} from "../schemas";

const CALENDAR_EVENT_TYPES = new Set([
  "hackathon",
  "workshop",
  "meetup",
  "deadline",
  "other",
]);

function toEventType(category?: string | null): CalendarEvent["type"] {
  const normalized = category?.toLowerCase().trim();
  if (normalized && CALENDAR_EVENT_TYPES.has(normalized)) {
    return normalized as CalendarEvent["type"];
  }
  return "other";
}

function dashboardEventToCalendarEvent(
  item: DashboardCalendarEventItem,
): CalendarEvent | null {
  if (!item.start) return null;
  return {
    id: item.id,
    title: item.title,
    description: "",
    date: item.start,
    type: toEventType(item.category_name),
    location: item.venue_type ?? "",
    link: item.slug
      ? `/dashboard/events/${item.slug}`
      : `/dashboard/events/${item.id}`,
  };
}

const SESSION_STATUS_TYPE: Record<string, CalendarEvent["type"]> = {
  SCHEDULED: "workshop",
  COMPLETED: "other",
  CANCELLED: "deadline",
};

function dashboardSessionToCalendarEvent(
  item: DashboardCalendarSessionItem,
): CalendarEvent | null {
  if (!item.starts_at) return null;
  return {
    id: item.id,
    title: item.title,
    description: item.description ?? "",
    date: item.starts_at,
    type: SESSION_STATUS_TYPE[item.status] ?? "other",
    location: "",
    link: item.meeting_link ?? "",
  };
}

export function flattenDashboardCalendar(
  buckets?: DashboardCalendarBuckets | null,
): CalendarEvent[] {
  if (!buckets) return [];
  const events = [
    ...buckets.events.upcoming,
    ...buckets.events.ongoing,
    ...buckets.events.completed,
  ]
    .map(dashboardEventToCalendarEvent)
    .filter((e): e is CalendarEvent => e !== null);
  const sessions = [
    ...buckets.sessions.upcoming,
    ...buckets.sessions.ongoing,
    ...buckets.sessions.completed,
  ]
    .map(dashboardSessionToCalendarEvent)
    .filter((e): e is CalendarEvent => e !== null);
  return [...events, ...sessions];
}
