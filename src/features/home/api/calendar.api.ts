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

import { publicApiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  CalendarBucketResponseSchema,
  type CalendarBuckets,
  CalendarEventBucketResponseSchema,
  type CalendarEventBuckets,
  type CalendarEventParams,
  type CalendarParams,
} from "../schemas";

// ─── Query Params ─────────────────────────────────────────────────────────────

function buildCalendarUrl(base: string, params?: CalendarParams): string {
  const q = new URLSearchParams();
  if (params?.month) q.set("month", params.month);
  if (params?.status) q.set("status", params.status);
  const qs = q.toString();
  return qs ? `${base}?${qs}` : base;
}

function buildEventCalendarUrl(
  base: string,
  params?: CalendarEventParams,
): string {
  const q = new URLSearchParams();
  if (params?.month) q.set("month", params.month);
  if (params?.scope) q.set("scope", params.scope);
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

// ─── Event Calendar API Functions ────────────────────────────────────────────

/**
 * GET /api/v1/calendar/events/
 *
 * Global platform events calendar grouped into upcoming / ongoing / completed.
 */
export async function fetchGlobalEventCalendar(
  params?: CalendarEventParams,
): Promise<CalendarEventBuckets> {
  const url = buildEventCalendarUrl(endpoints.calendar.events, params);
  const res = await publicApiClient.get(url, CalendarEventBucketResponseSchema);
  return res.response;
}

/**
 * GET /api/v1/calendar/ig/<ig_id>/events/
 *
 * Events calendar scoped to a specific Interest Group.
 */
export async function fetchIgEventCalendar(
  igId: string,
  params?: CalendarEventParams,
): Promise<CalendarEventBuckets> {
  const url = buildEventCalendarUrl(endpoints.calendar.igEvents(igId), params);
  const res = await publicApiClient.get(url, CalendarEventBucketResponseSchema);
  return res.response;
}

/**
 * GET /api/v1/calendar/campus/<campus_id>/events/
 *
 * Events calendar scoped to a specific Campus.
 */
export async function fetchCampusEventCalendar(
  campusId: string,
  params?: CalendarEventParams,
): Promise<CalendarEventBuckets> {
  const url = buildEventCalendarUrl(
    endpoints.calendar.campusEvents(campusId),
    params,
  );
  const res = await publicApiClient.get(url, CalendarEventBucketResponseSchema);
  return res.response;
}

/**
 * GET /api/v1/calendar/company/<company_id>/events/
 *
 * Events calendar scoped to a specific Company.
 */
export async function fetchCompanyEventCalendar(
  companyId: string,
  params?: CalendarEventParams,
): Promise<CalendarEventBuckets> {
  const url = buildEventCalendarUrl(
    endpoints.calendar.companyEvents(companyId),
    params,
  );
  const res = await publicApiClient.get(url, CalendarEventBucketResponseSchema);
  return res.response;
}
