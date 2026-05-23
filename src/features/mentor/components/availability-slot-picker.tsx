"use client";

import { Plus, Trash2 } from "lucide-react";
import { useId } from "react";
import { cn } from "@/lib/utils";
import type { TimeSlot, WeeklySchedule } from "../types";

const DAYS: { label: string; short: string; num: number }[] = [
  { label: "Monday", short: "Mon", num: 1 },
  { label: "Tuesday", short: "Tue", num: 2 },
  { label: "Wednesday", short: "Wed", num: 3 },
  { label: "Thursday", short: "Thu", num: 4 },
  { label: "Friday", short: "Fri", num: 5 },
  { label: "Saturday", short: "Sat", num: 6 },
  { label: "Sunday", short: "Sun", num: 0 },
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
  const rest = schedule.filter((d) => d.day !== day);
  return [...rest, { day, slots: [...slots, { ...DEFAULT_SLOT }] }];
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
  const slots = getSlots(schedule, day).map((s, i) =>
    i === idx ? { ...s, ...patch } : s,
  );
  const rest = schedule.filter((d) => d.day !== day);
  return [...rest, { day, slots }];
}

// ─── Component ───────────────────────────────────────────────

type Props = {
  value: WeeklySchedule;
  onChange: (schedule: WeeklySchedule) => void;
  disabled?: boolean;
};

export function AvailabilitySlotPicker({ value, onChange, disabled }: Props) {
  const id = useId();

  return (
    <div className="overflow-x-auto pb-1">
      <div className="grid min-w-145 grid-cols-7 gap-2">
        {DAYS.map(({ short, label, num }) => {
          const enabled = isDayEnabled(value, num);
          const slots = getSlots(value, num);
          const switchId = `${id}-day-${num}`;

          return (
            <div
              key={num}
              className={cn(
                "flex flex-col gap-2 rounded-2xl border p-3 transition-colors duration-200",
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
                          <input
                            type="time"
                            value={slot.start}
                            aria-label={`${label} slot ${idx + 1} start`}
                            disabled={disabled}
                            onChange={(e) =>
                              onChange(
                                updateSlot(value, num, idx, {
                                  start: e.target.value,
                                }),
                              )
                            }
                            className="w-full bg-transparent text-[11px] font-semibold text-foreground focus:outline-none disabled:opacity-50"
                          />
                          <div className="mx-0.5 h-px bg-border" />
                          <input
                            type="time"
                            value={slot.end}
                            aria-label={`${label} slot ${idx + 1} end`}
                            disabled={disabled}
                            onChange={(e) =>
                              onChange(
                                updateSlot(value, num, idx, {
                                  end: e.target.value,
                                }),
                              )
                            }
                            className="w-full bg-transparent text-[11px] text-muted-foreground focus:outline-none disabled:opacity-50"
                          />
                        </div>
                        {/* Delete button — visible on hover */}
                        <button
                          type="button"
                          onClick={() => onChange(removeSlot(value, num, idx))}
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
                    className="flex items-center justify-center gap-1 rounded-xl border border-dashed border-primary/30 py-1.5 text-[11px] font-medium text-primary/60 transition-colors hover:border-primary/60 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
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

      {/* Legend */}
      <p className="mt-3 text-[11px] text-muted-foreground">
        Toggle a day to set your availability. Hover a slot to remove it.
      </p>
    </div>
  );
}
