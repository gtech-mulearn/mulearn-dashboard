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
  type CollegeLeaderboardEntry,
  CollegeLeaderboardResponseSchema,
  type StudentLeaderboardEntry,
  StudentLeaderboardResponseSchema,
} from "../schemas";

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
): Promise<StudentLeaderboardEntry[]> {
  const endpoint = campus
    ? endpoints.leaderboard.wadhwaniCollege
    : endpoints.leaderboard.wadhwaniZonal;

  const response = await apiClient.get(
    endpoint,
    StudentLeaderboardResponseSchema,
  );
  return response.response;
}
