/**
 * Dashboard Calendar API
 *
 * 📍 src/features/home/api/calendar.api.ts
 *
 * Unified dashboard calendar: GET /api/v1/dashboard/calendar/events/
 * Returns Events + Mentorship Sessions pre-sorted into upcoming/ongoing/completed
 * buckets. Role/scope (global, company, IG, campus, mentor) is auto-detected
 * server-side from the JWT — anonymous callers get public data only.
 */

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  type DashboardCalendarBuckets,
  type DashboardCalendarParams,
  DashboardCalendarResponseSchema,
} from "../schemas";

function buildDashboardCalendarUrl(params: DashboardCalendarParams): string {
  const q = new URLSearchParams();
  if (params.month) q.set("month", params.month);
  if (params.year !== undefined) q.set("year", String(params.year));
  if (params.start_date) q.set("start_date", params.start_date);
  if (params.end_date) q.set("end_date", params.end_date);
  if (params.status) q.set("status", params.status);
  const qs = q.toString();
  return qs
    ? `${endpoints.calendar.dashboard}?${qs}`
    : endpoints.calendar.dashboard;
}

/**
 * GET /api/v1/dashboard/calendar/events/
 *
 * Caller must supply either `month` (+ optional `year`) or `start_date` &
 * `end_date` (max 93-day window). Works with or without an access token.
 */
export async function fetchDashboardCalendar(
  params: DashboardCalendarParams,
): Promise<DashboardCalendarBuckets> {
  const url = buildDashboardCalendarUrl(params);
  const res = await apiClient.get(url, DashboardCalendarResponseSchema, {
    skipAuthRedirectOn403: true,
  });
  return res.response;
}
