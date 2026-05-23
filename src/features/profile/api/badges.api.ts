/**
 * Badges API Functions
 *
 * 📍 src/features/profile/api/badges.api.ts
 *
 * Badge-related API calls with Zod validation.
 * Returns the inner response data (not the wrapper).
 */

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { type BadgesData, BadgesResponseSchema } from "../schemas";

export async function getBadges(muid: string): Promise<BadgesData> {
  const res = await apiClient.get(
    endpoints.user.badges(muid),
    BadgesResponseSchema,
  );
  return res.response;
}
