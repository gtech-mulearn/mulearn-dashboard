"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, ExternalLink, MapPin } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCalendarEvents } from "../hooks";
import type { CalendarEvent } from "../schemas";

// ─── Day abbreviations ─────────────────────────────────────────────────────

const WEEKDAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;

// ─── Color mapping for event types ──────────────────────────────────────────

const EVENT_TYPE_COLORS: Record<string, string> = {
  hackathon: "bg-chart-1 text-primary-foreground",
  workshop: "bg-chart-2 text-primary-foreground",
  meetup: "bg-chart-5 text-primary-foreground",
  deadline: "bg-destructive text-destructive-foreground",
  other: "bg-primary text-primary-foreground",
};

function getEventBg(type: string) {
  return EVENT_TYPE_COLORS[type] ?? EVENT_TYPE_COLORS.other;
}

// ─── Loading skeleton ───────────────────────────────────────────────────────

function CalendarSkeleton() {
  return (
    <div className="relative flex  flex-col overflow-hidden rounded-2xl border bg-card p-5 shadow-sm">
      {/* Decorative SVG */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 h-full w-1/2 opacity-[0.12]"
        viewBox="0 0 200 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="160"
          cy="100"
          r="80"
          stroke="currentColor"
          strokeWidth="2"
          className="text-brand-purple"
        />
        <circle
          cx="140"
          cy="380"
          r="100"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-brand-purple"
        />
        <rect
          x="80"
          y="220"
          width="60"
          height="60"
          rx="8"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-brand-purple"
        />
      </svg>
      <div className="relative z-10 mb-4 flex items-center justify-between">
        <div className="h-5 w-28 animate-pulse rounded-md bg-muted" />
        <div className="flex gap-1.5">
          <div className="size-8 animate-pulse rounded-full bg-muted" />
          <div className="size-8 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
      <div className="relative z-10 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={`wh-${day}`}
            className="mx-auto h-4 w-6 animate-pulse rounded bg-muted"
          />
        ))}
        {Array.from({ length: 35 }, (_, i) => `d-skeleton-${i}`).map((key) => (
          <div
            key={key}
            className="mx-auto size-9 animate-pulse rounded-full bg-muted"
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

type EventCalendarCardProps = {
  events?: CalendarEvent[];
  isLoading?: boolean;
};

export function EventCalendarCard({
  events: propEvents,
  isLoading: propIsLoading,
}: EventCalendarCardProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Generate calendar grid days (6 weeks)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const { data: fetchedEvents, isLoading: isFetching } = useCalendarEvents();

  const events = propEvents ?? fetchedEvents ?? [];
  const isLoading = propIsLoading ?? isFetching;

  // Build a map of dates → events for quick lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = event.date.slice(0, 10);
      const existing = map.get(key) ?? [];
      existing.push(event);
      map.set(key, existing);
    }
    return map;
  }, [events]);

  // Events for the selected date
  const selectedDateEvents = useMemo(() => {
    const key = format(selectedDate, "yyyy-MM-dd");
    return eventsByDate.get(key) ?? [];
  }, [selectedDate, eventsByDate]);

  const goToPrevMonth = useCallback(
    () => setCurrentMonth((m) => subMonths(m, 1)),
    [],
  );
  const goToNextMonth = useCallback(
    () => setCurrentMonth((m) => addMonths(m, 1)),
    [],
  );

  if (isLoading) return <CalendarSkeleton />;

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border bg-card p-5 shadow-sm">
      {/* ─── Decorative background SVG ─────────────────────────── */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 h-full w-1/2 opacity-[0.12]"
        viewBox="0 0 200 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="160"
          cy="100"
          r="80"
          stroke="currentColor"
          strokeWidth="2"
          className="text-brand-purple"
        />
        <circle
          cx="140"
          cy="380"
          r="100"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-brand-purple"
        />
        <rect
          x="80"
          y="220"
          width="60"
          height="60"
          rx="8"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-brand-purple"
        />
      </svg>

      {/* ─── Header: Month title + navigation arrows ────────────── */}
      <div className="relative z-10 mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground md:text-base">
          {format(currentMonth, "MMMM, yyyy")}
        </h3>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={goToPrevMonth}
            className="size-8"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            onClick={goToNextMonth}
            variant="outline"
            size="icon"
            className="size-8"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* ─── Weekday headers ─────────────────────────────────────── */}
      <div className="relative z-10 mb-2 grid grid-cols-7">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-[11px] font-semibold tracking-wide text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* ─── Calendar grid ───────────────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-7 gap-y-1">
        {calendarDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate.get(dateKey) ?? [];
          const hasEvents = dayEvents.length > 0;
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());

          // Pick the first event's type color for the circle
          const eventColor = hasEvents
            ? getEventBg(dayEvents[0].type ?? "other")
            : "";

          return (
            <Button
              key={dateKey}
              type="button"
              aria-label={format(day, "MMMM d, yyyy")}
              variant="secondary"
              onClick={() => setSelectedDate(day)}
              className={cn(
                "group/cell relative mx-auto flex size-9 items-center justify-center rounded-full text-sm transition-all duration-200 bg-transparent border-0 shadow-none",
                // Text colour — outside-month days dimmed
                isCurrentMonth
                  ? "text-foreground"
                  : "text-muted-foreground opacity-40",
                // Today: solid blue filled circle, no ring
                isToday && "bg-blue-500 text-white font-bold hover:bg-blue-600",
                // All other days (selected, has events, plain): transparent + hover only
                !isToday && "hover:bg-muted/60",
              )}
            >
              {day.getDate()}
              {/* Event dot indicator for days with events (non-today) */}
              {hasEvents && !isToday && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary" />
              )}
            </Button>
          );
        })}
      </div>

      {/* ─── Bottom section: events or blank space ────────────── */}
      <div className="relative z-10 mt-auto flex-1 pt-3">
        {selectedDateEvents.length > 0 ? (
          <div className="space-y-2 border-t border-border pt-3">
            <p className="text-xs font-semibold text-foreground">
              {format(selectedDate, "EEEE, MMM d")}
            </p>
            <div className="max-h-36 space-y-1.5 overflow-y-auto scrollbar-none">
              {selectedDateEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-2.5 rounded-xl bg-card p-2.5 transition-all hover:-translate-y-0.5"
                >
                  <div
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      getEventBg(event.type ?? "other"),
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">
                      {event.title}
                    </p>
                    {event.location && (
                      <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <MapPin className="size-2.5" />
                        {event.location}
                      </p>
                    )}
                  </div>
                  {event.link && (
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-primary transition-colors hover:text-primary/80"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Blank space — fills remainder of the card naturally */
          <div className="min-h-16" />
        )}
      </div>
    </div>
  );
}
