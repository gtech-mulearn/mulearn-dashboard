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

  if (newSlot.start >= newSlot.end) {
    toast.error("Start time must be before end time.", { id: "invalid-time" });
    return schedule;
  }

  const newSlots = slots.map((s, i) => (i === idx ? newSlot : s));

  const sorted = [...newSlots].sort((a, b) => a.start.localeCompare(b.start));
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].end > sorted[i + 1].start) {
      toast.error("Time slots cannot overlap.", { id: "overlap-time" });
      return schedule;
    }
  }

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
                        enabled ? "bg-primary" : "bg-muted-foreground/20",
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
                            className="group relative rounded-xl border border-border bg-background p-2 transition-shadow hover:shadow-sm"
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
