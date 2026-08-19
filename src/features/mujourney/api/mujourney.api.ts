/**
 * MuJourney API Functions
 *
 * 📍 src/features/mujourney/api/mujourney.api.ts
 *
 * All MuJourney-related API calls with Zod validation.
 * Uses the redesigned unified task list API: GET /api/v1/dashboard/task/list/
 */

import { apiClient, publicApiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  PublicUserJourneyResponseSchema,
  TaskListResponseSchema,
  UserLevelFeedResponseSchema,
} from "../schemas";

// ============================================
// Grouped Task List (Redesigned API)
// ============================================

/**
 * Fetch the grouped task list from the redesigned unified endpoint.
 * Returns { start_journey, become_expert, events }.
 *
 * - Unauthenticated: start_journey only; become_expert and events are []
 * - Authenticated: all three sections
 *
 * @param igId - Optional IG UUID — overrides which IG's tasks appear in become_expert
 */
export async function fetchTaskList(igId?: string, authenticated?: boolean) {
  const qs = igId ? `?ig_id=${igId}` : "";
  const client = authenticated ? apiClient : publicApiClient;
  return await client.get(
    `${endpoints.mujourney.taskList}${qs}`,
    TaskListResponseSchema,
  );
}
// ============================================
// Public Journey
// ============================================

/**
 * Fetch public user journey by MUID.
 * Shows another user's level progression and completed tasks.
 * @param muid - User's MUID
 */
export async function fetchPublicUserJourney(muid: string) {
  return await publicApiClient.get(
    endpoints.mujourney.getPublicUserLevels(muid),
    PublicUserJourneyResponseSchema,
  );
}

// ============================================
// User Level Feed
// ============================================

/**
 * Fetch user's task completion history/feed (for progress bar).
 */
export async function fetchUserLevelFeed() {
  return await apiClient.get(
    endpoints.mujourney.userLevelFeed,
    UserLevelFeedResponseSchema,
  );
}
