/**
 * MuJourney API Functions
 *
 * 📍 src/features/mujourney/api/mujourney.api.ts
 *
 * All MuJourney-related API calls with Zod validation.
 */

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  GetUserLevelsResponseSchema,
  PublicListLevelsResponseSchema,
  PublicUserJourneyResponseSchema,
  TaskListResponseSchema,
  UserLevelFeedResponseSchema,
} from "../schemas";

// ============================================
// Start Learning (Foundation Tasks)
// ============================================

/**
 * Fetch user's level progression with tasks (logged-in users)
 * Shows unlocked levels, completed tasks, karma progress
 */
export async function fetchUserLevels() {
  return await apiClient.get(
    endpoints.mujourney.getUserLevels,
    GetUserLevelsResponseSchema,
  );
}

/**
 * Fetch public levels/tasks (public users, no auth)
 * Shows all foundational tasks across 7 levels
 */
export async function fetchPublicLevels() {
  return await apiClient.get(
    endpoints.mujourney.publicListLevels,
    PublicListLevelsResponseSchema,
  );
}

// ============================================
// Become Expert (Interest Group Tasks)
// ============================================

/**
 * Fetch interest-group specific tasks (#cl- hashtags)
 * @param igId - Interest Group ID
 * @param perPage - Items per page (optional)
 */
export async function fetchIGTasks(igId: string, perPage = 20) {
  return await apiClient.get(
    `${endpoints.mujourney.taskList}?ig_id=${igId}&perPage=${perPage}`,
    TaskListResponseSchema,
  );
}

// ============================================
// Public Journey
// ============================================

/**
 * Fetch public user journey by MUID
 * Shows another user's level progression and completed tasks
 * @param muid - User's MUID
 */
export async function fetchPublicUserJourney(muid: string) {
  return await apiClient.get(
    endpoints.mujourney.getPublicUserLevels(muid),
    PublicUserJourneyResponseSchema,
  );
}

// ============================================
// User Level Feed
// ============================================

/**
 * Fetch user's task completion history/feed
 */
export async function fetchUserLevelFeed() {
  return await apiClient.get(
    endpoints.mujourney.userLevelFeed,
    UserLevelFeedResponseSchema,
  );
}
