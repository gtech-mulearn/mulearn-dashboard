import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  InterestGroupsListResponseSchema,
  KarmaFeedResponseSchema,
} from "../schemas";

// ============================================
// Interest Groups
// ============================================

/** Get list of all interest groups */
export async function getInterestGroupsList() {
  const response = await apiClient.get(
    endpoints.dashboard.interestGroups,
    InterestGroupsListResponseSchema,
  );
  return response.response.interestGroup;
}

// ============================================
// Karma Feed
// ============================================

/** Get dashboard karma feed */
export async function getKarmaFeed() {
  const response = await apiClient.get(
    endpoints.dashboard.karmaFeed,
    KarmaFeedResponseSchema,
  );
  return response.response;
}
