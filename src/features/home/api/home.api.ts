import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  EventRowSchema,
  EventsSchema,
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

// ============================================
// Events (OpenSheet)
// ============================================

export async function getEvents() {
  try {
    const res = await fetch(endpoints.dashboard.events);

    if (!res.ok) {
      throw new Error(`Failed to fetch events: ${res.statusText}`);
    }

    const raw = await res.json();

    // Validate raw rows
    const rows = EventRowSchema.array().safeParse(raw);

    if (!rows.success) {
      console.error("Invalid events data structure", rows.error);
      return [];
    }

    // Map to UI shape and validate
    const mapped = rows.data
      .map((event) => ({
        name: event.Name || "No Name",
        description: event.Description || "No Description",
        poster: event.Poster || "",
        link: event.Links || "#",
        date: event.Date || "No Date",
        status: event.Status || "",
      }))
      .filter((event) => event.status !== "Expired");

    return EventsSchema.parse(mapped);
  } catch (error) {
    console.error("Error fetching events:", error);
    // Return empty array as fallback instead of Crashing
    return [];
  }
}
