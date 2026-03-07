/**
 * Home Feature Schemas
 *
 * 📍 src/features/home/schemas/home.schema.ts
 */

import { z } from "zod";

// ============================================
// Django Response Wrapper (reusable)
// ============================================

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: dataSchema,
  });

// ============================================
// Interest Groups (/api/v1/dashboard/ig/list/)
// ============================================

export const InterestGroupListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().optional(),
});
export type InterestGroupListItem = z.infer<typeof InterestGroupListItemSchema>;

export const InterestGroupsListDataSchema = z.object({
  interestGroup: z.array(InterestGroupListItemSchema),
});
export type InterestGroupsListData = z.infer<
  typeof InterestGroupsListDataSchema
>;

export const InterestGroupsListResponseSchema = ApiResponseSchema(
  InterestGroupsListDataSchema,
);
export type InterestGroupsListResponse = z.infer<
  typeof InterestGroupsListResponseSchema
>;

// ============================================
// Karma Feed (/api/v1/dashboard/profile/karma-feed/)
// ============================================

export const KarmaFeedResponseSchema = ApiResponseSchema(
  z.object({
    top_user: z.object({
      karma: z.number(),
      full_name: z.string(),
      muid: z.string(),
    }),
    top_college: z.object({
      karma: z.number(),
      name: z.string(),
    }),
  }),
);
export type KarmaFeedResponse = z.infer<typeof KarmaFeedResponseSchema>;

// ============================================
// Events (OpenSheet / external feed)
// ============================================

export const EventRowSchema = z.object({
  Name: z.string().optional(),
  Description: z.string().optional(),
  Poster: z.string().optional(),
  Links: z.string().optional(),
  Date: z.string().optional(),
  Status: z.string().optional(),
});
export type EventRow = z.infer<typeof EventRowSchema>;

export const EventSchema = z.object({
  name: z.string(),
  description: z.string(),
  poster: z.string(),
  link: z.string(),
  date: z.string(),
  status: z.string(),
});
export type Event = z.infer<typeof EventSchema>;

// Array of mapped events
export const EventsSchema = z.array(EventSchema);
export type Events = z.infer<typeof EventsSchema>;

// ============================================
// Calendar Events (/api/v1/dashboard/events/calendar/)
// ============================================

export const CalendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().default(""),
  date: z.string(), // ISO date string e.g. "2026-03-15"
  type: z
    .enum(["hackathon", "workshop", "meetup", "deadline", "other"])
    .optional()
    .default("other"),
  location: z.string().optional().default(""),
  link: z.string().optional().default(""),
});
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

export const CalendarEventsDataSchema = z.object({
  events: z.array(CalendarEventSchema),
});

export const CalendarEventsResponseSchema = ApiResponseSchema(
  CalendarEventsDataSchema,
);
export type CalendarEventsResponse = z.infer<
  typeof CalendarEventsResponseSchema
>;
