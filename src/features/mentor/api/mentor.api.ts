import { z } from "zod";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  AvailabilityCalendarSlot,
  TimeSlot,
  WeeklySchedule,
} from "../types";

// ─── Schemas ────────────────────────────────────────────────

const ApiResponseOf = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: dataSchema,
  });

// Backend returns paginated list of individual slot records
const BackendSlotSchema = z.object({
  id: z.string(),
  weekday: z.coerce.number().int().min(0).max(6),
  start_time: z.string(), // "HH:MM:SS"
  end_time: z.string(),
});

const AvailabilityListResponseSchema = ApiResponseOf(
  z.object({
    data: z.array(BackendSlotSchema).optional().default([]),
    pagination: z.unknown().optional(),
  }),
);

const AvailabilityCalendarSlotSchema = z.object({
  id: z.string(),
  mentor_user_id: z.string(),
  mentor_full_name: z.string().optional(),
  mentor_name: z.string().optional(),
  ig_id: z.string().nullable().optional(),
  ig_name: z.string().nullable().optional(),
  weekday: z.coerce.number().int().min(0).max(6),
  start_time: z.string(),
  end_time: z.string(),
  timezone: z.string().optional().default("Asia/Kolkata"),
  is_active: z.boolean().optional().default(true),
  valid_from: z.string().nullable().optional(),
  valid_to: z.string().nullable().optional(),
  created_at: z.string().optional(),
});

const AvailabilityCalendarResponseSchema = ApiResponseOf(
  z.array(AvailabilityCalendarSlotSchema),
);

// ─── Time format helpers ────────────────────────────────────

function toHHmm(t: string): string {
  // backend "HH:MM:SS" → "HH:MM"
  return t.slice(0, 5);
}

function toHHmmss(t: string): string {
  // frontend "HH:MM" → "HH:MM:SS"
  return t.length === 5 ? `${t}:00` : t;
}

// ─── API Functions ──────────────────────────────────────────

export async function getAvailabilitySlots(): Promise<WeeklySchedule> {
  const res = await apiClient.get(
    `${endpoints.mentor.availabilitySlots}?perPage=200`,
    AvailabilityListResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  const slots = Array.isArray(res.response?.data) ? res.response.data : [];

  // Group slots by weekday
  const byDay = new Map<number, TimeSlot[]>();
  for (const s of slots) {
    const arr = byDay.get(s.weekday) ?? [];
    arr.push({ start: toHHmm(s.start_time), end: toHHmm(s.end_time) });
    byDay.set(s.weekday, arr);
  }

  return Array.from(byDay.entries()).map(([day, slots]) => ({ day, slots }));
}

export async function fetchAvailabilityCalendar(): Promise<
  AvailabilityCalendarSlot[]
> {
  const res = await apiClient.get(
    endpoints.mentor.availabilityCalendar,
    AvailabilityCalendarResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return res.response;
}

// Fetch raw slot records with their backend IDs (used for deletion)
async function getRawSlots(): Promise<{ id: string }[]> {
  const res = await apiClient.get(
    `${endpoints.mentor.availabilitySlots}?perPage=200`,
    AvailabilityListResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return Array.isArray(res.response?.data) ? res.response.data : [];
}

export async function createAvailabilitySlots(
  schedule: WeeklySchedule,
): Promise<void> {
  // Full-replace strategy: delete existing slots, then create new ones.
  const existing = await getRawSlots();

  await Promise.all(
    existing.map((slot) =>
      apiClient.delete(
        `${endpoints.mentor.availabilitySlots}${slot.id}/`,
        undefined,
        z.unknown(),
        { skipAuthRedirectOn403: true },
      ),
    ),
  );

  // Flatten schedule into per-slot POSTs
  const posts: Promise<unknown>[] = [];
  for (const day of schedule) {
    for (const slot of day.slots) {
      posts.push(
        apiClient.post(
          endpoints.mentor.availabilitySlots,
          {
            weekday: day.day,
            start_time: toHHmmss(slot.start),
            end_time: toHHmmss(slot.end),
          },
          z.unknown(),
          { skipAuthRedirectOn403: true },
        ),
      );
    }
  }

  await Promise.all(posts);
}
