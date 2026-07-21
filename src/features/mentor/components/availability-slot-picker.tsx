"use client";

import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { ScrollableTimePicker } from "@/components/ui/custom-datetime-picker";
import { cn } from "@/lib/utils";
import type { TimeSlot, WeeklySchedule } from "../types";

const DAYS: { label: string; short: string; num: number }[] = [
  { label: "Sunday", short: "Sun", num: 0 },
  { label: "Monday", short: "Mon", num: 1 },
  { label: "Tuesday", short: "Tue", num: 2 },
  { label: "Wednesday", short: "Wed", num: 3 },
  { label: "Thursday", short: "Thu", num: 4 },
  { label: "Friday", short: "Fri", num: 5 },
  { label: "Saturday", short: "Sat", num: 6 },
];

const DEFAULT_SLOT: TimeSlot = { start: "09:00", end: "17:00" };

// ─── Time helpers ("HH:MM" ↔ minutes) ────────────────────────

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function fromMinutes(n: number): string {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, n));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ─── Overlap detection (for inline validation, used by the parent too) ──────────

/** Indices of slots that overlap at least one other slot on the same day. */
export function getOverlappingSlotIndices(slots: TimeSlot[]): Set<number> {
  const overlapping = new Set<number>();
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      // Overlap (touching boundaries like 09:00–10:00 / 10:00–11:00 is allowed).
      if (slots[i].start < slots[j].end && slots[j].start < slots[i].end) {
        overlapping.add(i);
        overlapping.add(j);
      }
    }
  }
  return overlapping;
}

/** True if any day in the schedule has overlapping slots (blocks save). */
export function scheduleHasOverlap(schedule: WeeklySchedule): boolean {
  return schedule.some((d) => getOverlappingSlotIndices(d.slots).size > 0);
}

// ─── Pure schedule helpers ───────────────────────────────────

function getSlots(schedule: WeeklySchedule, day: number): TimeSlot[] {
  return schedule.find((d) => d.day === day)?.slots ?? [];
}

function isDayEnabled(schedule: WeeklySchedule, day: number): boolean {
  return schedule.some((d) => d.day === day && d.slots.length > 0);
}

function toggleDay(
  schedule: WeeklySchedule,
  day: number,
  enable: boolean,
): WeeklySchedule {
  const rest = schedule.filter((d) => d.day !== day);
  if (!enable) return rest;
  return [...rest, { day, slots: [{ ...DEFAULT_SLOT }] }];
}

function addSlot(schedule: WeeklySchedule, day: number): WeeklySchedule {
  const slots = getSlots(schedule, day);

  let newSlot: TimeSlot | null = null;
  for (let hour = 8; hour <= 21; hour++) {
    const start = `${hour.toString().padStart(2, "0")}:00`;
    const end = `${(hour + 1).toString().padStart(2, "0")}:00`;

    const overlaps = slots.some((s) => start < s.end && end > s.start);
    if (!overlaps) {
      newSlot = { start, end };
      break;
    }
  }

  if (!newSlot) {
    toast.error("No available 1-hour slots left on this day.", {
      id: "no-slots",
    });
    return schedule;
  }

  const rest = schedule.filter((d) => d.day !== day);
  return [...rest, { day, slots: [...slots, newSlot] }];
}

function removeSlot(
  schedule: WeeklySchedule,
  day: number,
  idx: number,
): WeeklySchedule {
  const slots = getSlots(schedule, day).filter((_, i) => i !== idx);
  const rest = schedule.filter((d) => d.day !== day);
  if (slots.length === 0) return rest;
  return [...rest, { day, slots }];
}

function updateSlot(
  schedule: WeeklySchedule,
  day: number,
  idx: number,
  patch: Partial<TimeSlot>,
): WeeklySchedule {
  const slots = getSlots(schedule, day);
  const newSlot = { ...slots[idx], ...patch };
  const otherSlots = slots.filter((_, i) => i !== idx);

  const startMins = toMinutes(newSlot.start);
  let endMins = toMinutes(newSlot.end);

  if (startMins === endMins) {
    toast.error("Start and end time should be different", {
      id: "same-time-toast",
    });
  }

  // Ensure end is strictly after start without modifying the start time
  if (startMins >= endMins) {
    endMins = startMins + 60;
    // Cap at 23:59 equivalent
    if (endMins >= 24 * 60) {
      endMins = 24 * 60 - 1;
    }
  }

  // Prevent overlap: find the next slot that starts after or at our start time
  const upcomingSlots = otherSlots
    .filter((s) => toMinutes(s.start) >= startMins)
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

  const nextSlot = upcomingSlots[0];

  let didClamp = false;

  if (nextSlot) {
    const nextStartMins = toMinutes(nextSlot.start);
    // Clamp the end time so it doesn't cross into the next slot
    if (endMins > nextStartMins) {
      endMins = nextStartMins;
      didClamp = true;
      // If clamping makes end <= start (e.g. they share the same start time),
      // allow a minimal 1-hour slot so it doesn't break, and the overlap error handles it.
      if (endMins <= startMins) {
        endMins = startMins + 60;
      }
    }
  }

  newSlot.start = fromMinutes(startMins);
  newSlot.end = fromMinutes(endMins);

  const currentlyOverlaps = otherSlots.some(
    (s) =>
      toMinutes(newSlot.start) < toMinutes(s.end) &&
      toMinutes(newSlot.end) > toMinutes(s.start),
  );

  if (didClamp || currentlyOverlaps) {
    toast.error("Meeting time should not overlap", { id: "overlap-toast" });
  }

  // Overlaps are NOT completely reverted if they start inside another slot —
  // they're surfaced inline and block Save.
  const newSlots = slots.map((s, i) => (i === idx ? newSlot : s));
  const rest = schedule.filter((d) => d.day !== day);
  return [...rest, { day, slots: newSlots }];
}

// ─── Component ───────────────────────────────────────────────

type Props = {
  value: WeeklySchedule;
  onChange: (schedule: WeeklySchedule) => void;
  disabled?: boolean;
};

export function AvailabilitySlotPicker({ value, onChange, disabled }: Props) {
  const id = useId();
  const [startIndex, setStartIndex] = useState(0);

  const handleNext = () => {
    setStartIndex((prev) => Math.min(prev + 2, 5));
  };

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(prev - 2, 0));
  };

  return (
    <div className="pb-1">
      <div className="relative">
        {/* Prev Arrow */}
        {startIndex > 0 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute -left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-background shadow-md transition-colors hover:bg-muted md:hidden disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
        )}

        {/* Next Arrow */}
        {startIndex < 5 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute -right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-background shadow-md transition-colors hover:bg-muted md:hidden disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        )}

        <div className="overflow-hidden md:overflow-visible">
          <div
            className="flex gap-2 md:grid md:grid-cols-7"
            style={{ "--slide-idx": startIndex } as React.CSSProperties}
          >
            {DAYS.map(({ short, label, num }, _index) => {
              const enabled = isDayEnabled(value, num);
              const slots = getSlots(value, num);
              const overlappingIdx = getOverlappingSlotIndices(slots);
              const switchId = `${id}-day-${num}`;
              return (
                <div
                  key={num}
                  className={cn(
                    "flex flex-col gap-2 rounded-2xl border p-3",
                    "w-[calc(50%-0.25rem)] shrink-0 md:w-auto",
                    "transition-transform duration-300 ease-in-out",
                    "translate-x-[calc(var(--slide-idx)*-100%-var(--slide-idx)*0.5rem)] md:translate-x-0",
                    enabled
                      ? "border-primary/20 bg-primary/4"
                      : "border-border bg-card",
                  )}
                >
                  {/* Day header with toggle */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        enabled ? "text-primary" : "text-muted-foreground/60",
                      )}
                    >
                      {short}
                    </span>
                    <button
                      id={switchId}
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      aria-label={`Toggle ${label}`}
                      disabled={disabled}
                      onClick={() => onChange(toggleDay(value, num, !enabled))}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                        enabled ? "bg-brand-blue" : "bg-muted-foreground/20",
                        disabled && "cursor-not-allowed opacity-40",
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200",
                          enabled ? "translate-x-4" : "translate-x-0",
                        )}
                      />
                    </button>
                  </div>

                  {/* Time slots */}
                  {enabled && (
                    <>
                      <div className="space-y-1.5">
                        {slots.map((slot, idx) => (
                          <div
                            // biome-ignore lint/suspicious/noArrayIndexKey: slots have no stable id
                            key={idx}
                            className={cn(
                              "group relative rounded-xl border bg-background p-2 transition-shadow hover:shadow-sm",
                              overlappingIdx.has(idx)
                                ? "border-destructive ring-1 ring-destructive/40"
                                : "border-border",
                            )}
                          >
                            <div className="space-y-1">
                              <ScrollableTimePicker
                                value={slot.start}
                                aria-label={`${label} slot ${idx + 1} start`}
                                disabled={disabled}
                                onChange={(val) =>
                                  onChange(
                                    updateSlot(value, num, idx, {
                                      start: val,
                                    }),
                                  )
                                }
                                className="w-full bg-transparent text-[11px] font-semibold text-foreground focus:outline-none disabled:opacity-50 cursor-pointer"
                              />
                              <div className="mx-0.5 h-px bg-border" />
                              <ScrollableTimePicker
                                value={slot.end}
                                aria-label={`${label} slot ${idx + 1} end`}
                                disabled={disabled}
                                onChange={(val) =>
                                  onChange(
                                    updateSlot(value, num, idx, {
                                      end: val,
                                    }),
                                  )
                                }
                                className="w-full bg-transparent text-[11px] text-muted-foreground focus:outline-none disabled:opacity-50 cursor-pointer"
                              />
                            </div>
                            {/* Delete button — visible on hover */}
                            <button
                              type="button"
                              onClick={() =>
                                onChange(removeSlot(value, num, idx))
                              }
                              disabled={disabled}
                              aria-label="Remove time slot"
                              className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 disabled:pointer-events-none"
                            >
                              <Trash2 className="size-2" />
                            </button>
                            {overlappingIdx.has(idx) && (
                              <p className="mt-1 text-[10px] font-medium text-destructive">
                                Overlaps another slot
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Add slot button */}
                      <button
                        type="button"
                        onClick={() => onChange(addSlot(value, num))}
                        disabled={disabled}
                        className="flex items-center justify-center gap-1 rounded-xl border border-dashed border-primary/30 py-1.5 text-[11px] font-medium text-primary/60 transition-colors hover:border-primary/60 hover:text-primary disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
                      >
                        <Plus className="size-3" />
                        Add
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <p className="mt-3 text-[11px] text-muted-foreground">
        Toggle a day to set your availability. Hover a slot to remove it.
      </p>
    </div>
  );
}
