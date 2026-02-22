/**
 * Meeting Schemas
 *
 * 📍 src/features/learning-circle/schemas/meeting.schema.ts
 *
 * Zod schemas for Learning Circle Meetings - matches backend serializers.
 */

import { z } from "zod";
import { ApiResponseSchema } from "./circle.schema";

// ============================================
// Meeting Schemas
// ============================================

/**
 * Meeting attendee - from CircleMeetupInfoSerializer.get_attendees
 */
export const MeetingAttendeeSchema = z.object({
  user_id: z.string(),
  full_name: z.string(),
  is_joined: z.boolean(),
  is_report_submitted: z.boolean(),
  profile_pic: z.string().nullable(),
  is_same_org: z.boolean().optional(),
});

export type MeetingAttendee = z.infer<typeof MeetingAttendeeSchema>;

/**
 * Meeting list item - matches CircleMeetupMinSerializer
 * Used for meeting list endpoints
 */
export const MeetingSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  org: z.string().nullable(),
  ig_id: z.string(),
  ig_name: z.string(),
  mode: z.string(), // "online" or "offline"
  is_recurring: z.boolean(),
  recurrence_type: z.string().nullable(),
  recurrence: z.number().nullable(),
  meet_place: z.string(),
  circle_id: z.string(),
  coord_x: z.number(),
  coord_y: z.number(),
  meet_time: z.string(),
  meet_link: z.string().nullable(),
  is_started: z.boolean(),
  is_ended: z.boolean(),
  is_joined: z.boolean().optional(),
  is_rsvp: z.boolean().optional(),
  attendees_count: z.number(),
  created_by: z.string(),
  created_by_id: z.string(),
});

export type Meeting = z.infer<typeof MeetingSchema>;

/**
 * Public meeting - matches CircleMeetupPublicSerializer
 */
export const PublicMeetingSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  org: z.string().nullable(),
  ig_id: z.string(),
  ig_name: z.string(),
  mode: z.string(),
  is_recurring: z.boolean(),
  recurrence_type: z.string().nullable(),
  recurrence: z.number().nullable(),
  meet_place: z.string(),
  circle_id: z.string(),
  meet_time: z.string(),
  meet_link: z.string().nullable(),
  is_started: z.boolean(),
  is_ended: z.boolean(),
  created_by: z.string(),
});

export type PublicMeeting = z.infer<typeof PublicMeetingSchema>;

/**
 * Meeting detail - matches CircleMeetupInfoSerializer
 */
export const MeetingDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  mode: z.string(),
  meet_place: z.string(),
  meet_link: z.string().nullable(),
  meet_time: z.string(),
  ig: z.string(),
  is_report_needed: z.boolean(),
  report_description: z.string().nullable(),
  coord_x: z.number(),
  coord_y: z.number(),
  duration: z.number(),
  is_started: z.boolean(),
  is_ended: z.boolean(),
  is_member: z.boolean(),
  meet_code: z.string().nullable(), // Only visible to creator
  created_by_id: z.string(),
  attendees: z.array(MeetingAttendeeSchema),
});

export type MeetingDetail = z.infer<typeof MeetingDetailSchema>;

// ============================================
// Request Schemas
// ============================================

export const CreateMeetingRequestSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  mode: z.enum(["online", "offline"]),
  platform: z
    .enum(["Zoom", "Google Meet", "Microsoft Teams", "Discord", "Other"])
    .optional()
    .nullable(),
  meet_place: z.string().min(1).max(100),
  meet_link: z.string().url().optional().nullable(),
  meet_time: z.string(),
  duration: z.number().min(1).max(24),
  coord_x: z.number(),
  coord_y: z.number(),
  is_recurring: z.boolean(),
  recurrence_type: z.enum(["weekly", "monthly"]).optional().nullable(),
  recurrence: z.number().optional().nullable(),
  is_report_needed: z.boolean(),
  report_description: z.string().max(1000).optional().nullable(),
});

export type CreateMeetingRequest = z.infer<typeof CreateMeetingRequestSchema>;

export const JoinMeetingRequestSchema = z.object({
  meet_code: z.string().length(6, "Meeting code must be 6 characters"),
});

export type JoinMeetingRequest = z.infer<typeof JoinMeetingRequestSchema>;

export const AttendeeReportRequestSchema = z
  .object({
    report: z.string().optional(),
    report_link: z.string().url().optional(),
  })
  .refine(
    (data) => data.report || data.report_link,
    "Either report or report link is required",
  );

export type AttendeeReportRequest = z.infer<typeof AttendeeReportRequestSchema>;

export const MeetingReportRequestSchema = z.object({
  report: z.string().min(1, "Report is required"),
  attendees: z.record(z.string(), z.boolean()),
});

export type MeetingReportRequest = z.infer<typeof MeetingReportRequestSchema>;

// ============================================
// Response Schemas
// ============================================

export const MeetingListResponseSchema = ApiResponseSchema(
  z.array(MeetingSchema),
);

export const MeetingDetailResponseSchema =
  ApiResponseSchema(MeetingDetailSchema);

/** Public meetings with pagination - matches paginated_response format */
export const PublicMeetingListResponseSchema = z.object({
  hasError: z.boolean().optional(),
  statusCode: z.number(),
  data: z.array(PublicMeetingSchema),
  pagination: z.object({
    currentPage: z.number(),
    perPage: z.number(),
    totalPages: z.number(),
    totalItems: z.number(),
  }),
});

export type PublicMeetingListResponse = z.infer<
  typeof PublicMeetingListResponseSchema
>;

/** Attendee report response */
export const AttendeeReportResponseSchema = ApiResponseSchema(
  z.object({
    report: z.string().nullable(),
    report_link: z.string().nullable(),
  }),
);

/** Organizer report response */
export const MeetingReportResponseSchema = ApiResponseSchema(
  z.object({
    is_report_submitted: z.boolean(),
    report: z.string().nullable(),
    attendees: z.array(
      z.object({
        user_id: z.string(),
        full_name: z.string(),
        muid: z.string(),
        is_lc_approved: z.boolean(),
        report: z.string().nullable(),
        report_link: z.string().nullable(),
      }),
    ),
  }),
);
