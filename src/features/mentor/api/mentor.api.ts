import { z } from "zod";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  AvailabilityCalendarSlot,
  TimeSlot,
  WeeklySchedule,
} from "../types";

// ─── Schemas ─────────────────────────────────────────────────────────────────

// Lenient envelope — coerces hasError/statusCode and accepts message in any
// shape the backend happens to return (plain string, record, null, etc.).
// This prevents ⚠️ schema-mismatch warnings caused by envelope field variance.
const ApiResponseOf = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z
    .object({
      hasError: z.coerce.boolean().optional().default(false),
      statusCode: z.coerce.number().optional(),
      message: z.unknown().optional(), // backend sends string | record | null
      response: dataSchema,
    })
    .passthrough(); // ignore extra envelope fields

// Doc: weekday is an integer; 0 = Sunday is accepted (the picker uses 0 for Sun).
// No min(1) constraint — the backend accepts 0 for Sunday per the component mapping.
const _BackendSlotSchema = z
  .object({
    id: z.string().optional(), // may be absent on POST response
    weekday: z.coerce.number().int(), // 0=Sunday accepted; no min/max restriction
    start_time: z.string(), // "HH:MM:SS"
    end_time: z.string(),
    ig: z.string().nullable().optional(),
    ig_id: z.string().nullable().optional(),
    ig_name: z.string().nullable().optional(),
    timezone: z.string().optional().default("Asia/Kolkata"),
    is_active: z.coerce.boolean().optional().default(true), // coerce in case backend sends 0/1
    valid_from: z.string().nullable().optional(),
    valid_to: z.string().nullable().optional(),
  })
  .passthrough(); // silently ignore any extra fields the backend may add

// Use z.unknown() for the response field so Zod never rejects the envelope
// regardless of whether the backend sends an array, a paginated object, or
// any other shape. The extractSlots() helper below normalises all cases.
const AvailabilityListResponseSchema = ApiResponseOf(z.unknown());

// Normalise every possible shape the backend might return for the response field:
//   • flat array              → [...]
//   • paginated { data: [] }  → { data: [...] }
//   • paginated { results: [] } → { results: [...] }
//   • single object           → wrapped into [obj]
//   • null / undefined        → []
type RawSlot = Record<string, unknown>;
function extractSlots(raw: unknown): RawSlot[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as RawSlot[];
  if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as RawSlot[];
    if (Array.isArray(obj.results)) return obj.results as RawSlot[];
    // Single slot object wrapped as an array
    if ("weekday" in obj || "start_time" in obj) return [obj];
  }
  return [];
}

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

// ─── #9 GET /availability/ — flat list (response is a direct array per docs) ─
export async function getAvailabilitySlots(): Promise<WeeklySchedule> {
  const res = await apiClient.get(
    endpoints.mentor.availabilitySlots,
    AvailabilityListResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  // extractSlots handles flat array, { data: [] }, { results: [] }, single obj, or null
  const slots = extractSlots(res.response);

  // Group slots by weekday
  const byDay = new Map<number, TimeSlot[]>();
  for (const s of slots) {
    const weekday = Number(s.weekday);
    const startTime = String(s.start_time ?? "");
    const endTime = String(s.end_time ?? "");
    if (!startTime || !endTime) continue; // skip malformed slots
    const arr = byDay.get(weekday) ?? [];
    arr.push({ start: toHHmm(startTime), end: toHHmm(endTime) });
    byDay.set(weekday, arr);
  }

  return Array.from(byDay.entries()).map(([day, daySlots]) => ({
    day,
    slots: daySlots,
  }));
}

// Fetch raw slot records with their backend IDs (used for delete-all strategy)
async function getRawSlots(): Promise<{ id: string }[]> {
  const res = await apiClient.get(
    endpoints.mentor.availabilitySlots,
    AvailabilityListResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  // extractSlots handles all backend shapes; keep only slots that have an id
  const slots = extractSlots(res.response);
  return slots.filter(
    (s): s is { id: string } & RawSlot => typeof s.id === "string",
  );
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
  ig?: string | null; // docs: nullable · optional
  weekday: number; // docs: required integer
  start_time: string; // docs: required, time format HH:MM:SS
  end_time: string; // docs: required, time format HH:MM:SS
  timezone?: string; // docs: optional, max 64 chars
  is_active?: boolean;
  valid_from?: string | null; // docs: nullable · optional date
  valid_to?: string | null; // docs: nullable · optional date
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

// ─── GET /availability/ — raw slot list (for calendar view) ─────────────────
// Uses the same lenient AvailabilityListResponseSchema as getAvailabilitySlots
// so all three GET calls against the same endpoint parse consistently.
export async function fetchAvailabilityCalendar(): Promise<
  AvailabilityCalendarSlot[]
> {
  const res = await apiClient.get(
    endpoints.mentor.availabilitySlots,
    AvailabilityListResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  // extractSlots handles all backend shapes; cast to AvailabilityCalendarSlot
  return extractSlots(res.response) as unknown as AvailabilityCalendarSlot[];
}

// ─── Overview & Status ───────────────────────────────────────────────────────

export async function getMentorOverview() {
  return apiClient.get(
    endpoints.mentor.overview,
    ApiResponseOf(z.unknown()), // Schema validation handled in hook if needed, or loosely typed
    { skipAuthRedirectOn403: true },
  );
}
