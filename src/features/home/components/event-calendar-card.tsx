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
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "../schemas";

// ─── Day abbreviations ─────────────────────────────────────────────────────

const WEEKDAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;

// ─── Color mapping for event types ──────────────────────────────────────────

const EVENT_TYPE_COLORS: Record<string, string> = {
  hackathon: "bg-chart-1 text-white",
  workshop: "bg-chart-2 text-white",
  meetup: "bg-chart-5 text-white",
  deadline: "bg-destructive text-white",
  other: "bg-primary text-primary-foreground",
};

function getEventBg(type: string) {
  return EVENT_TYPE_COLORS[type] ?? EVENT_TYPE_COLORS.other;
}

// ─── Loading skeleton ───────────────────────────────────────────────────────

function CalendarSkeleton() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-linear-to-br from-violet-300 via-purple-200 to-purple-100 p-5 shadow-sm">
      {/* Decorative SVG */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 h-full w-1/2 opacity-[0.12]"
        viewBox="0 0 200 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="160" cy="100" r="80" stroke="#7c3aed" strokeWidth="2" />
        <circle cx="140" cy="380" r="100" stroke="#7c3aed" strokeWidth="1.5" />
        <rect
          x="80"
          y="220"
          width="60"
          height="60"
          rx="8"
          stroke="#7c3aed"
          strokeWidth="1.5"
        />
      </svg>
      <div className="relative z-10 mb-4 flex items-center justify-between">
        <div className="h-5 w-28 animate-pulse rounded-md bg-violet-600/10" />
        <div className="flex gap-1.5">
          <div className="size-8 animate-pulse rounded-full bg-violet-600/10" />
          <div className="size-8 animate-pulse rounded-full bg-violet-600/10" />
        </div>
      </div>
      <div className="relative z-10 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={`wh-${day}`}
            className="mx-auto h-4 w-6 animate-pulse rounded bg-violet-600/10"
          />
        ))}
        {Array.from({ length: 35 }, (_, i) => `d-skeleton-${i}`).map((key) => (
          <div
            key={key}
            className="mx-auto size-9 animate-pulse rounded-full bg-violet-600/10"
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
  events = [],
  isLoading,
}: EventCalendarCardProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

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

  // Generate calendar grid days (6 weeks)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

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
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border-none bg-linear-to-br from-violet-300 via-purple-200 to-purple-100 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-5">
      {/* ─── Decorative background SVG ─────────────────────────── */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 h-full w-1/2 opacity-[0.12]"
        viewBox="0 0 200 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="160" cy="100" r="80" stroke="#7c3aed" strokeWidth="2" />
        <circle cx="140" cy="380" r="100" stroke="#7c3aed" strokeWidth="1.5" />
        <rect
          x="80"
          y="220"
          width="60"
          height="60"
          rx="8"
          stroke="#7c3aed"
          strokeWidth="1.5"
        />
      </svg>

      {/* ─── Header: Month title + navigation arrows ────────────── */}
      <div className="relative z-10 mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-violet-900 md:text-base">
          {format(currentMonth, "MMMM, yyyy")}
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={goToPrevMonth}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-violet-600/15 text-violet-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-110 hover:bg-violet-600/25 hover:shadow-lg active:scale-95"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-violet-600/15 text-violet-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-110 hover:bg-violet-600/25 hover:shadow-lg active:scale-95"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* ─── Weekday headers ─────────────────────────────────────── */}
      <div className="relative z-10 mb-2 grid grid-cols-7">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-[11px] font-semibold tracking-wide text-violet-500"
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
            <button
              key={dateKey}
              type="button"
              onClick={() => setSelectedDate(day)}
              className={cn(
                "group/cell relative mx-auto flex size-9 items-center justify-center rounded-full text-sm transition-all duration-200",
                // Default state
                isCurrentMonth ? "text-violet-900" : "text-violet-300",
                // Hover
                !isSelected && !hasEvents && "hover:bg-violet-600/10",
                // Today ring indicator
                isToday &&
                  !isSelected &&
                  !hasEvents &&
                  "font-bold ring-2 ring-violet-500/40",
                // Selected (no event) — violet circle
                isSelected &&
                  !hasEvents &&
                  "bg-violet-600 text-white font-semibold shadow-md",
                // Has events — colored circle
                hasEvents &&
                  !isSelected &&
                  cn(eventColor, "font-semibold shadow-sm"),
                // Has events + selected — outlined
                hasEvents &&
                  isSelected &&
                  cn(
                    eventColor,
                    "font-semibold shadow-md ring-2 ring-violet-600 ring-offset-2 ring-offset-purple-100",
                  ),
              )}
            >
              {day.getDate()}
              {/* Multiple event indicator dot */}
              {hasEvents && dayEvents.length > 1 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-white shadow-sm">
                  {dayEvents.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Bottom section: events or blank space ────────────── */}
      <div className="relative z-10 mt-auto flex-1 pt-3">
        {selectedDateEvents.length > 0 ? (
          <div className="space-y-2 border-t border-violet-300/40 pt-3">
            <p className="text-xs font-semibold text-violet-600">
              {format(selectedDate, "EEEE, MMM d")}
            </p>
            <div className="max-h-36 space-y-1.5 overflow-y-auto scrollbar-none">
              {selectedDateEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-2.5 rounded-xl bg-white p-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      getEventBg(event.type ?? "other"),
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-gray-800">
                      {event.title}
                    </p>
                    {event.location && (
                      <p className="flex items-center gap-1 text-[10px] text-gray-500">
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
