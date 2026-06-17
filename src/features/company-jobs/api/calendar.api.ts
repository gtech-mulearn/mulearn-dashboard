/**
 * Calendar API
 *
 * 📍 src/features/company-jobs/api/calendar.api.ts
 *
 * Session calendar endpoints for Company, IG Mentor, and Campus Mentor views.
 * Base: /api/v1/calendar/
 *
 * All endpoints are PUBLIC (no auth required).
 * Sessions are grouped into upcoming / ongoing / completed buckets.
 * Items use MentorshipSessionCalendarSerializer — include mentor_name and
 * mentee_count, NOT a participants array.
 */

import { z } from "zod";
import { publicApiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const DjangoResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean().optional(),
    statusCode: z.number().optional(),
    message: z.unknown().optional(),
    response: dataSchema,
  });

/** Single session item in a calendar bucket */
export const CalendarSessionItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  mode: z.string().optional(),
  starts_at: z.string(),
  ends_at: z.string(),
  status: z
    .enum(["SCHEDULED", "COMPLETED", "CANCELLED", "PENDING_APPROVAL"])
    .or(z.string()),
  meeting_link: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
  mentor_name: z.string().optional(),
  mentee_count: z.coerce.number().default(0),
});
export type CalendarSessionItem = z.infer<typeof CalendarSessionItemSchema>;

/** Calendar response grouped into upcoming / ongoing / completed */
export const CalendarBucketResponseSchema = DjangoResponse(
  z.object({
    upcoming: z.array(CalendarSessionItemSchema).default([]),
    ongoing: z.array(CalendarSessionItemSchema).default([]),
    completed: z.array(CalendarSessionItemSchema).default([]),
  }),
);
export type CalendarBuckets = {
  upcoming: CalendarSessionItem[];
  ongoing: CalendarSessionItem[];
  completed: CalendarSessionItem[];
};

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface CalendarParams {
  /** Filter by month: YYYY-MM (e.g. "2026-06") */
  month?: string;
  /** Filter by session status */
  status?: "SCHEDULED" | "COMPLETED" | "CANCELLED";
}

function buildCalendarUrl(base: string, params?: CalendarParams): string {
  const q = new URLSearchParams();
  if (params?.month) q.set("month", params.month);
  if (params?.status) q.set("status", params.status);
  const qs = q.toString();
  return qs ? `${base}?${qs}` : base;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * GET /api/v1/calendar/company/<company_org_id>/sessions/
 *
 * Calendar view of all mentorship sessions for a specific company org.
 * company_org_id — UUID of the company's Organisation record (org_type = Company)
 */
export async function fetchCompanySessionCalendar(
  companyOrgId: string,
  params?: CalendarParams,
): Promise<CalendarBuckets> {
  const url = buildCalendarUrl(
    endpoints.calendar.companySessions(companyOrgId),
    params,
  );
  const res = await publicApiClient.get(url, CalendarBucketResponseSchema);
  return res.response;
}

/**
 * GET /api/v1/calendar/ig-mentor/<ig_id>/sessions/
 *
 * Calendar view of mentorship sessions for a specific Interest Group.
 */
export async function fetchIgMentorSessionCalendar(
  igId: string,
  params?: CalendarParams,
): Promise<CalendarBuckets> {
  const url = buildCalendarUrl(
    endpoints.calendar.igMentorSessions(igId),
    params,
  );
  const res = await publicApiClient.get(url, CalendarBucketResponseSchema);
  return res.response;
}

/**
 * GET /api/v1/calendar/campus-mentor/<campus_id>/sessions/
 *
 * Calendar view of mentorship sessions for a specific campus (college org).
 */
export async function fetchCampusMentorSessionCalendar(
  campusId: string,
  params?: CalendarParams,
): Promise<CalendarBuckets> {
  const url = buildCalendarUrl(
    endpoints.calendar.campusMentorSessions(campusId),
    params,
  );
  const res = await publicApiClient.get(url, CalendarBucketResponseSchema);
  return res.response;
}
