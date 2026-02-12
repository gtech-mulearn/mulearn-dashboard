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
  try {
    return await apiClient.get(
      endpoints.mujourney.getUserLevels,
      GetUserLevelsResponseSchema,
    );
  } catch (error) {
    console.error("Error fetching user levels:", error);
    // Return empty data structure instead of throwing
    return {
      hasError: false,
      statusCode: 200,
      message: null,
      response: [],
    };
  }
}

/**
 * Fetch public levels/tasks (public users, no auth)
 * Shows all foundational tasks across 7 levels
 */
export async function fetchPublicLevels() {
  try {
    return await apiClient.get(
      endpoints.mujourney.publicListLevels,
      PublicListLevelsResponseSchema,
    );
  } catch (error) {
    console.error("Error fetching public levels:", error);
    // Return empty data structure instead of throwing
    return {
      hasError: false,
      statusCode: 200,
      message: null,
      response: [],
    };
  }
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
  try {
    return await apiClient.get(
      `${endpoints.mujourney.taskList}?ig_id=${igId}&perPage=${perPage}`,
      TaskListResponseSchema,
    );
  } catch (error) {
    console.error("Error fetching IG tasks:", error);
    return {
      hasError: false,
      statusCode: 200,
      message: null,
      response: {
        data: [],
        pagination: null,
      },
    };
  }
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
  try {
    return await apiClient.get(
      endpoints.mujourney.getPublicUserLevels(muid),
      PublicUserJourneyResponseSchema,
    );
  } catch (error) {
    console.error("Error fetching public user journey:", error);
    throw error; // Re-throw for this one since it's a specific user lookup
  }
}

// ============================================
// User Level Feed
// ============================================

/**
 * Fetch user's task completion history/feed
 */
export async function fetchUserLevelFeed() {
  try {
    return await apiClient.get(
      endpoints.mujourney.userLevelFeed,
      UserLevelFeedResponseSchema,
    );
  } catch (error) {
    console.error("Error fetching user level feed:", error);
    return {
      hasError: false,
      statusCode: 200,
      message: null,
      response: {
        feed: [],
      },
    };
  }
}
