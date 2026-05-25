import { z } from "zod";

// Matches backend KarmaReviewQueueSerializer
export const ReviewItemSchema = z.object({
  id: z.string(),
  user_name: z.string(),
  user_muid: z.string().optional().default(""),
  task_title: z.string(),
  task_hashtag: z.string().optional().default(""),
  ig_name: z.string().nullable().optional(),
  karma: z.coerce.number().default(0),
  mentor_review_status: z
    .enum(["PENDING", "APPROVED", "REJECTED"])
    .default("PENDING"),
  mentor_reviewed_at: z.string().nullable().optional(),
  mentor_review_feedback: z.string().nullable().optional(),
  created_at: z.string(),
});
export type ReviewItem = z.infer<typeof ReviewItemSchema>;

export const ReviewListResponseSchema = z.object({
  statusCode: z.number().optional(),
  response: z.object({
    data: z.array(ReviewItemSchema),
    pagination: z
      .object({
        count: z.number().optional(),
        totalPages: z.coerce.number().default(1),
        isNext: z.boolean().optional(),
        isPrev: z.boolean().optional(),
        nextPage: z.number().nullable().optional(),
      })
      .optional(),
  }),
});

// Matches backend KarmaReviewSerializer body
export const ReviewActionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  feedback: z.string().optional(),
});
export type ReviewActionValues = z.infer<typeof ReviewActionSchema>;

export const GenericResponseSchema = z.object({
  statusCode: z.number().optional(),
  response: z.unknown(),
});
