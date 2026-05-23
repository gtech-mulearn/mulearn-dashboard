import { z } from "zod";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { WeeklySchedule } from "../types";

// ─── Schemas ────────────────────────────────────────────────

const ApiResponseOf = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: dataSchema,
  });

const TimeSlotSchema = z.object({
  start: z.string(),
  end: z.string(),
});

const DayAvailabilitySchema = z.object({
  day: z.number().min(0).max(6),
  slots: z.array(TimeSlotSchema),
});

const AvailabilityResponseSchema = ApiResponseOf(
  z.object({
    schedule: z.array(DayAvailabilitySchema),
  }),
);

// ─── API Functions ──────────────────────────────────────────

export async function getAvailabilitySlots(): Promise<WeeklySchedule> {
  const res = await apiClient.get(
    endpoints.mentor.availabilitySlots,
    AvailabilityResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return res.response.schedule;
}

export async function createAvailabilitySlots(
  schedule: WeeklySchedule,
): Promise<void> {
  await apiClient.post(
    endpoints.mentor.availabilitySlots,
    { schedule },
    z.unknown(),
    { skipAuthRedirectOn403: true },
  );
}
