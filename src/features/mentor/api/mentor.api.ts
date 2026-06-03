import { z } from "zod";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  AvailabilityCalendarSlot,
  TimeSlot,
  WeeklySchedule,
} from "../types";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const ApiResponseOf = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: dataSchema,
  });

// Doc: weekday 1=Monday … 7=Sunday
const BackendSlotSchema = z.object({
  id: z.string(),
  weekday: z.coerce.number().int().min(1).max(7),
  start_time: z.string(), // "HH:MM:SS"
  end_time: z.string(),
  ig: z.string().nullable().optional(),
  ig_id: z.string().nullable().optional(),
  ig_name: z.string().nullable().optional(),
  timezone: z.string().optional().default("Asia/Kolkata"),
  is_active: z.boolean().optional().default(true),
  valid_from: z.string().nullable().optional(),
  valid_to: z.string().nullable().optional(),
});

const AvailabilityListResponseSchema = ApiResponseOf(
  z.object({
    data: z.array(BackendSlotSchema).optional().default([]),
    pagination: z.unknown().optional(),
  }),
);

export const AvailabilityCalendarSlotSchema = z.object({
  id: z.string(),
  mentor_user_id: z.string(),
  mentor_full_name: z.string().optional(),
  mentor_name: z.string().optional(),
  ig_id: z.string().nullable().optional(),
  ig_name: z.string().nullable().optional(),
  weekday: z.coerce.number().int().min(1).max(7), // doc: 1–7
  start_time: z.string(),
  end_time: z.string(),
  timezone: z.string().optional().default("Asia/Kolkata"),
  is_active: z.boolean().optional().default(true),
  valid_from: z.string().nullable().optional(),
  valid_to: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const AvailabilityCalendarResponseSchema = ApiResponseOf(
  z.array(AvailabilityCalendarSlotSchema),
);

// ─── Time format helpers ──────────────────────────────────────────────────────

function toHHmm(t: string): string {
  // backend "HH:MM:SS" → "HH:MM"
  return t.slice(0, 5);
}

function toHHmmss(t: string): string {
  // frontend "HH:MM" → "HH:MM:SS"
  return t.length === 5 ? `${t}:00` : t;
}

// ─── API Functions ────────────────────────────────────────────────────────────

// ─── #9 GET /availability/ — paginated slot list ─────────────────────────────
export async function getAvailabilitySlots(): Promise<WeeklySchedule> {
  const res = await apiClient.get(
    `${endpoints.mentor.availabilitySlots}?perPage=200`,
    AvailabilityListResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  const slots = Array.isArray(res.response?.data) ? res.response.data : [];

  // Group slots by weekday (1=Mon … 7=Sun per doc)
  const byDay = new Map<number, TimeSlot[]>();
  for (const s of slots) {
    const arr = byDay.get(s.weekday) ?? [];
    arr.push({ start: toHHmm(s.start_time), end: toHHmm(s.end_time) });
    byDay.set(s.weekday, arr);
  }

  return Array.from(byDay.entries()).map(([day, daySlots]) => ({
    day,
    slots: daySlots,
  }));
}

// Fetch raw slot records with their backend IDs (used for delete-all strategy)
async function getRawSlots(): Promise<{ id: string }[]> {
  const res = await apiClient.get(
    `${endpoints.mentor.availabilitySlots}?perPage=200`,
    AvailabilityListResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return Array.isArray(res.response?.data) ? res.response.data : [];
}

// ─── #9 POST + #10 DELETE — Full-replace strategy ────────────────────────────
// Deletes all existing slots then creates new ones from the schedule.
// Each slot now includes the `ig` field required by the doc.
export async function createAvailabilitySlots(
  schedule: WeeklySchedule,
  igId?: string,
): Promise<void> {
  // Step 1: delete all existing slots
  const existing = await getRawSlots();
  await Promise.all(
    existing.map((slot) =>
      apiClient.delete(
        endpoints.mentor.availabilitySlot(slot.id),
        undefined,
        z.unknown(),
        { skipAuthRedirectOn403: true },
      ),
    ),
  );

  // Step 2: create new slots
  const posts: Promise<unknown>[] = [];
  for (const day of schedule) {
    for (const slot of day.slots) {
      const payload: Record<string, unknown> = {
        weekday: day.day, // 1–7 (Mon–Sun per doc)
        start_time: toHHmmss(slot.start),
        end_time: toHHmmss(slot.end),
        timezone: "Asia/Kolkata",
        is_active: true,
      };
      if (igId) payload.ig = igId; // required by doc when posting
      posts.push(
        apiClient.post(
          endpoints.mentor.availabilitySlots,
          payload,
          z.unknown(),
          { skipAuthRedirectOn403: true },
        ),
      );
    }
  }

  await Promise.all(posts);
}

// ─── #9 POST /availability/ — Create a single slot ───────────────────────────
export interface CreateSlotPayload {
  ig: string; // required by doc
  weekday: number; // 1–7
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  timezone?: string;
  is_active?: boolean;
  valid_from?: string;
  valid_to?: string;
}

export async function createAvailabilitySlot(
  payload: CreateSlotPayload,
): Promise<void> {
  await apiClient.post(
    endpoints.mentor.availabilitySlots,
    payload,
    z.unknown(),
    { skipAuthRedirectOn403: true },
  );
}

// ─── #10 GET /availability/<slot_id>/ — Single slot detail ───────────────────
export async function fetchAvailabilityCalendar(): Promise<
  AvailabilityCalendarSlot[]
> {
  // Doc: public availability uses /public/availability/<mentor_id>/
  // This function is kept for the mentor's own slot list view
  const res = await apiClient.get(
    endpoints.mentor.availabilitySlots,
    AvailabilityCalendarResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return res.response;
}
