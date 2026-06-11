/**
 * Leaderboard API Functions
 *
 * 📍 src/features/leaderboard/api/leaderboard.api.ts
 *
 * All leaderboard-related API calls go through here.
 * NO direct fetch calls in components or hooks.
 * NO React dependencies - this is pure data layer.
 *
 * Pattern: Validate full response, extract and return inner data.
 */

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  type CampusMentorLeaderboardEntry,
  CampusMentorLeaderboardResponseSchema,
  type CollegeLeaderboardEntry,
  CollegeLeaderboardResponseSchema,
  type IgMentorLeaderboardEntry,
  IgMentorLeaderboardResponseSchema,
  type MentorLeaderboardEntry,
  MentorLeaderboardResponseSchema,
  type StudentLeaderboardEntry,
  StudentLeaderboardResponseSchema,
  type WadhwaniLeaderboardEntry,
  WadhwaniLeaderboardResponseSchema,
} from "@/features/leaderboard";

/**
 * Fetch student leaderboard (overall or monthly)
 */
export async function fetchStudentLeaderboard(
  monthly: boolean = false,
): Promise<StudentLeaderboardEntry[]> {
  const endpoint = monthly
    ? endpoints.leaderboard.studentsMonthly
    : endpoints.leaderboard.students;

  const response = await apiClient.get(
    endpoint,
    StudentLeaderboardResponseSchema,
  );
  return response.response;
}

/**
 * Fetch college leaderboard (overall or monthly)
 */
export async function fetchCampusLeaderboard(
  monthly: boolean = false,
): Promise<CollegeLeaderboardEntry[]> {
  const endpoint = monthly
    ? endpoints.leaderboard.collegeMonthly
    : endpoints.leaderboard.college;

  const response = await apiClient.get(
    endpoint,
    CollegeLeaderboardResponseSchema,
  );
  return response.response;
}

/**
 * Fetch Wadhwani leaderboard (campus or zonal)
 */
export async function fetchWadhwaniLeaderboard(
  campus: boolean = false,
): Promise<WadhwaniLeaderboardEntry[]> {
  const endpoint = campus
    ? endpoints.leaderboard.wadhwaniCollege
    : endpoints.leaderboard.wadhwaniZonal;

  const response = await apiClient.get(
    endpoint,
    WadhwaniLeaderboardResponseSchema,
  );
  return response.response;
}

/**
 * Fetch mentor leaderboard
 */
export async function fetchMentorLeaderboard(): Promise<
  MentorLeaderboardEntry[]
> {
  const response = await apiClient.get(
    "/api/v1/dashboard/mentor/leaderboard/",
    MentorLeaderboardResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return response.response.data;
}

/**
 * §6.1 — Fetch IG Mentor leaderboard for a specific Interest Group.
 * Ranked by completed sessions in that IG (desc), then total karma (tiebreaker).
 * Public endpoint — no auth required.
 */
export async function fetchIgMentorLeaderboard(
  igId: string,
): Promise<IgMentorLeaderboardEntry[]> {
  const response = await apiClient.get(
    endpoints.leaderboard.igMentor(igId),
    IgMentorLeaderboardResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return response.response;
}

/**
 * §6.2 — Fetch Campus Mentor leaderboard for a specific campus (college org).
 * Ranked by completed campus sessions (desc), then total karma (tiebreaker).
 * Public endpoint — no auth required.
 */
export async function fetchCampusMentorLeaderboard(
  campusId: string,
): Promise<CampusMentorLeaderboardEntry[]> {
  const response = await apiClient.get(
    endpoints.leaderboard.campusMentor(campusId),
    CampusMentorLeaderboardResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return response.response;
}
