/**
 * Learning Circle Schemas
 *
 * 📍 src/features/learning-circle/schemas/circle.schema.ts
 *
 * Zod schemas for Learning Circles - matches backend serializers.
 */

import { z } from "zod";

// ============================================
// Shared Schemas
// ============================================

/**
 * User basic info returned in created_by field
 * Note: API doesn't return 'id' for created_by
 */
export const UserBasicSchema = z.object({
  id: z.string().optional(), // Not always present
  full_name: z.string(),
  profile_pic: z.string().nullable().optional(),
  muid: z.string().optional(),
});

export type UserBasic = z.infer<typeof UserBasicSchema>;

// ============================================
// Learning Circle Schemas
// ============================================

/**
 * Circle list item - matches actual API response from /learningcircle/
 * Fields: id, ig, title, org, attendees
 */
export const LearningCircleSchema = z
  .preprocess(
    (val) => {
      if (
        val &&
        typeof val === "object" &&
        "circle" in val &&
        val.circle &&
        typeof val.circle === "object"
      ) {
        return {
          ...(val.circle as object),
          ...val,
        };
      }
      return val;
    },
    z.object({
      id: z.union([z.string(), z.number()]).optional(),
      circle_id: z.union([z.string(), z.number()]).optional(),
      ig: z.string().nullable().optional(),
      title: z.string().nullable().optional(),
      name: z.string().nullable().optional(),
      org: z.string().nullable().optional(),
      total_members: z.number().nullable().optional(),
      attendees: z.array(z.unknown()).nullable().optional(),
      is_joined: z.boolean().nullable().optional(),
      is_creator: z.boolean().nullable().optional(),
    }),
  )
  .transform((val) => {
    const idVal = val.id ?? val.circle_id;
    return {
      id: idVal !== undefined ? String(idVal) : "",
      circle_id:
        val.circle_id !== undefined ? String(val.circle_id) : undefined,
      ig: val.ig ?? "",
      title: val.title ?? val.name ?? "",
      org: val.org ?? null,
      total_members: val.total_members ?? null,
      attendees: val.attendees ?? null,
      is_joined: val.is_joined ?? false,
      is_creator: val.is_creator ?? false,
    };
  });

export type LearningCircle = z.infer<typeof LearningCircleSchema>;

/**
 * Circle detail - matches actual API response from /learningcircle/<id>/
 * Actual response: id, ig, title, description, org, is_recurring, recurrence_type, recurrence, created_by
 */
/**
 * next_meetup shape returned by LearningCircleDetailSerializer.get_next_meetup:
 *  - is_scheduled=true  → a pending CircleMeetingLog exists; full meeting data included
 *  - is_scheduled=false → no pending meeting; meet_time is the suggested next date
 *  - null               → circle has no meetings or last meeting was not recurring
 */
const NextMeetupSchema = z
  .object({
    is_scheduled: z.boolean(),
    meet_time: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough() // allow extra meeting fields when is_scheduled=true
  .nullable();

export type NextMeetup = z.infer<typeof NextMeetupSchema>;

export const LearningCircleDetailSchema = z.object({
  id: z.string(),
  ig: z.string(),
  title: z.string(),
  description: z.string().nullable().default(""),
  org: z.string().nullable(),
  is_recurring: z.boolean().optional().default(false),
  recurrence_type: z.string().nullable().optional(),
  recurrence: z.number().nullable().optional(),
  created_by: UserBasicSchema,
  rank: z.number().nullable().optional(),
  total_karma: z.number().nullable().optional(),
  total_members: z.number().nullable().optional(),
  next_meetup: NextMeetupSchema.optional(),
});

export type LearningCircleDetail = z.infer<typeof LearningCircleDetailSchema>;

/**
 * Circle member - matches LearningCircleMemberDetailsView response
 */
export const CircleMemberSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  profile_pic: z.string().nullable(),
  muid: z.string(),
  ig_karma: z.number().optional(),
  is_leader: z.boolean().optional(),
});

export type CircleMember = z.infer<typeof CircleMemberSchema>;

// ============================================
// Request Schemas
// ============================================

export const CreateCircleRequestSchema = z.object({
  ig: z.string().min(1, "Interest group is required"),
  org: z.string().min(1, "Organization is required"),
  title: z.string().min(1).max(100, "Title must be 100 characters or less"),
  description: z
    .string()
    .min(1)
    .max(500, "Description must be 500 characters or less"),
});

export type CreateCircleRequest = z.infer<typeof CreateCircleRequestSchema>;

export const EditCircleRequestSchema = CreateCircleRequestSchema.partial();
export type EditCircleRequest = z.infer<typeof EditCircleRequestSchema>;

/** Accept or reject a pending member */
export const ApproveMemberRequestSchema = z.object({
  muid: z.string(),
  flag: z.boolean(), // true = accept, false = reject
});
export type ApproveMemberRequest = z.infer<typeof ApproveMemberRequestSchema>;

/** Transfer lead role to another member */
export const TransferLeadRequestSchema = z.object({
  muid: z.string(),
});
export type TransferLeadRequest = z.infer<typeof TransferLeadRequestSchema>;

/** Send an invite to a user */
export const SendInviteRequestSchema = z.object({
  muid: z.string().min(1, "User ID is required"),
});
export type SendInviteRequest = z.infer<typeof SendInviteRequestSchema>;

/** Accept or reject an invitation */
export const InviteResponseRequestSchema = z.object({
  action: z.enum(["accept", "reject"]),
});
export type InviteResponseRequest = z.infer<typeof InviteResponseRequestSchema>;

// ============================================
// Invite Schemas
// ============================================

export const InviteUserSchema = z.object({
  user_id: z.string().optional(),
  full_name: z.string().optional(),
  profile_pic: z.string().nullable().optional(),
});

export type InviteUser = z.infer<typeof InviteUserSchema>;

/** Invite item returned by invite/sent and invite/status endpoints */
export const InviteSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  link_id: z.string().optional(),
  circle_id: z.string().optional(),
  circle_name: z.string().optional(),
  circle_title: z.string().optional(),
  circle: z.string().optional(),
  title: z.string().optional(),
  user: z.union([z.string(), InviteUserSchema]).optional(),
  muid: z.string().optional(),
  invited_by: z.union([z.string(), InviteUserSchema]).optional(),
  is_accepted: z
    .union([z.boolean(), z.string(), z.number()])
    .nullable()
    .optional(),
  created_at: z.string().nullable().optional(),
  status: z.string().optional(),
  invited_at: z.string().nullable().optional(),
  user_id: z.string().optional(),
  full_name: z.string().optional(),
  profile_pic: z.string().nullable().optional(),
});

export type Invite = z.infer<typeof InviteSchema>;

// ============================================
// Response Schemas - matches Django CustomResponse
// ============================================

/**
 * Generic API response wrapper for Django CustomResponse
 */
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean().optional(),
    statusCode: z.number(),
    message: z
      .object({
        general: z.array(z.string()).optional(),
      })
      .optional(),
    response: dataSchema,
  });

export const InviteListResponseSchema = ApiResponseSchema(
  z.array(InviteSchema),
);

export const InviteByLinkResponseSchema = ApiResponseSchema(InviteSchema);

// ============================================
// Join Request Schemas (lead/creator view of pending join requests)
// Matches backend CircleJoinRequestSerializer (GET join/<circle_id>/).
// ============================================

export const JoinRequestSchema = z.object({
  link_id: z.string(),
  user_id: z.string(),
  full_name: z.string(),
  profile_pic: z.string().nullable().optional(),
  muid: z.string(),
  requested_at: z.string().nullable().optional(),
});

export type JoinRequest = z.infer<typeof JoinRequestSchema>;

export const JoinRequestListResponseSchema = ApiResponseSchema(
  z.array(JoinRequestSchema),
);

/** Body for PATCH join/<circle_id>/ — accept or reject a pending request. */
export const RespondJoinRequestSchema = z.object({
  link_id: z.string(),
  action: z.enum(["accept", "reject"]),
});

export type RespondJoinRequest = z.infer<typeof RespondJoinRequestSchema>;

/**
 * Pagination shape returned by Django
 */
export const PaginationSchema = z.object({
  count: z.number(),
  totalPages: z.number(),
  isNext: z.boolean(),
  isPrev: z.boolean(),
  nextPage: z.number().nullable(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

export const CircleListResponseSchema = ApiResponseSchema(
  z.object({
    data: z.array(LearningCircleSchema),
    pagination: PaginationSchema,
  }),
);

export const UserCircleListResponseSchema = ApiResponseSchema(
  z.array(LearningCircleSchema),
);

export const CircleDetailResponseSchema = ApiResponseSchema(
  LearningCircleDetailSchema,
);

export const CircleMembersResponseSchema = ApiResponseSchema(
  z.object({
    owner: UserBasicSchema.nullable(),
    members: z.array(CircleMemberSchema),
  }),
);

export const CreateCircleResponseSchema = ApiResponseSchema(
  z.object({ circle_id: z.string() }),
);

export const EmptyResponseSchema = z.object({
  hasError: z.boolean().optional(),
  statusCode: z.number(),
  message: z
    .object({
      general: z.array(z.string()).optional(),
    })
    .optional(),
  response: z.unknown().optional(),
});

// ============================================
// College List Schemas (for create form dropdown)
// ============================================

/**
 * College list item from /api/v1/dashboard/college/
 * Note: The backend returns college.id but LC create needs org.id
 * Fields like total_karma can return object or number on exception
 */
export const CollegeListItemSchema = z.object({
  id: z.string(), // College ID
  level: z.number().nullable().optional(),
  org: z.string(), // Organization name (title)
  number_of_members: z.unknown().optional(),
  total_karma: z.unknown().optional(),
  no_of_lc: z.unknown().optional(),
  no_of_alumni: z.number().nullable().optional(),
});

export type CollegeListItem = z.infer<typeof CollegeListItemSchema>;

export const CollegeListResponseSchema = z.object({
  hasError: z.boolean().optional(),
  statusCode: z.number(),
  message: z
    .object({
      general: z.array(z.string()).optional(),
    })
    .optional(),
  response: z.object({
    data: z.array(CollegeListItemSchema),
    pagination: PaginationSchema,
  }),
});
