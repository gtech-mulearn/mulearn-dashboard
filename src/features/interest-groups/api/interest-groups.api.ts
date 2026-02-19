/**
 * Interest Groups API Layer
 *
 *  src/features/interest-groups/api/interest-group.api.ts
 *
 * Centralized API functions for interest groups.
 * These wrap the apiClient calls with proper typing and schema validation.
 */

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  InterestGroup,
  InterestGroupDetail,
  InterestGroupDetailResponse,
  InterestGroupsListResponse,
} from "../schemas/interest-groups.schema";
import {
  InterestGroupDetailResponseSchema,
  InterestGroupsListResponseSchema,
} from "../schemas/interest-groups.schema";

// ============================================
// Interest Groups List
// ============================================

/**
 * Fetch all interest groups
 * @param orderBy - Optional field name to order results by (e.g. "name", "-member_count")
 * @returns Promise with list of interest groups
 */
export async function getInterestGroupsList(
  orderBy?: string,
): Promise<InterestGroupsListResponse> {
  return apiClient.get(
    endpoints.interestGroups.list(orderBy),
    InterestGroupsListResponseSchema,
  );
}

/**
 * Extract interest groups array from API response
 * @param response - API response
 * @returns Array of interest groups
 */
export function extractInterestGroups(
  response: InterestGroupsListResponse,
): InterestGroup[] {
  return response.response?.interestGroup || [];
}

// ============================================
// Interest Group Detail
// ============================================

/**
 * Fetch details for a specific interest group
 * @param id - Interest group ID
 * @returns Promise with interest group details
 */
export async function getInterestGroupDetail(
  id: string,
): Promise<InterestGroupDetailResponse> {
  return apiClient.get(
    endpoints.interestGroups.detail(id),
    InterestGroupDetailResponseSchema,
  );
}

/**
 * Extract interest group detail from API response
 * @param response - API response
 * @returns Interest group detail object
 */
export function extractInterestGroupDetail(
  response: InterestGroupDetailResponse,
): InterestGroupDetail | null {
  return response.response?.interestGroup || null;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Search interest groups by name
 * @param groups - Array of interest groups
 * @param query - Search query
 * @returns Filtered array of interest groups
 */
export function searchInterestGroups(
  groups: InterestGroup[],
  query: string,
): InterestGroup[] {
  if (!query.trim()) return groups;

  const lowerQuery = query.toLowerCase().trim();
  return groups.filter((group) =>
    group.name.toLowerCase().includes(lowerQuery),
  );
}

/**
 * Sort interest groups by member count (descending)
 * @param groups - Array of interest groups
 * @returns Sorted array of interest groups
 */
export function sortInterestGroupsByMembers(
  groups: InterestGroup[],
): InterestGroup[] {
  return [...groups].sort((a, b) => {
    const countA = a.member_count || 0;
    const countB = b.member_count || 0;
    return countB - countA;
  });
}

/**
 * Sort interest groups by name (alphabetically)
 * @param groups - Array of interest groups
 * @returns Sorted array of interest groups
 */
export function sortInterestGroupsByName(
  groups: InterestGroup[],
): InterestGroup[] {
  return [...groups].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Filter interest groups by category
 * @param groups - Array of interest groups
 * @param category - Category to filter by
 * @returns Filtered array of interest groups
 */
export function filterInterestGroupsByCategory(
  groups: InterestGroup[],
  category: string,
): InterestGroup[] {
  if (!category) return groups;

  return groups.filter(
    (group) => group.category?.toLowerCase() === category.toLowerCase(),
  );
}

/**
 * Get unique categories from interest groups
 * @param groups - Array of interest groups
 * @returns Array of unique categories
 */
export function getInterestGroupCategories(groups: InterestGroup[]): string[] {
  const categories = groups
    .map((group) => group.category)
    .filter((category): category is string => !!category);

  return Array.from(new Set(categories)).sort();
}
