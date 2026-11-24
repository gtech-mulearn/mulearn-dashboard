/**
 * Intern Form Feature Schemas
 *
 * 📍 src/features/intern-form/schemas/intern-form-schema.ts
 *
 * Zod schemas for form validation.
 */

import { z } from "zod";

// ============================================
// Monthly Review Schema
// ============================================

export const MONTHLY_REVIEW_TEXT_MAX = 5000;
export const MONTHLY_REVIEW_FIELD_MAX = 2000;

/**
 * Monthly review form. Some review text is required: either the free-text
 * review, or at least one of learnings / challenges / next month's plan.
 * Month, team, leave days and tasks are filled in by the server.
 */
export const monthlyReviewSchema = z
  .object({
    monthlyReview: z
      .string()
      .max(MONTHLY_REVIEW_TEXT_MAX, "Max 5000 characters")
      .optional(),
    rating: z.string().optional(),
    learnings: z
      .string()
      .max(MONTHLY_REVIEW_FIELD_MAX, "Max 2000 characters")
      .optional(),
    challengesFaced: z
      .string()
      .max(MONTHLY_REVIEW_FIELD_MAX, "Max 2000 characters")
      .optional(),
    nextMonthPlan: z
      .string()
      .max(MONTHLY_REVIEW_FIELD_MAX, "Max 2000 characters")
      .optional(),
    blockers: z
      .string()
      .max(MONTHLY_REVIEW_FIELD_MAX, "Max 2000 characters")
      .optional(),
    suggestions: z
      .string()
      .max(MONTHLY_REVIEW_FIELD_MAX, "Max 2000 characters")
      .optional(),
  })
  .superRefine((data, ctx) => {
    const hasText = [
      data.monthlyReview,
      data.learnings,
      data.challengesFaced,
      data.nextMonthPlan,
    ].some((v) => v?.trim());
    if (!hasText) {
      ctx.addIssue({
        code: "custom",
        path: ["monthlyReview"],
        message:
          "Write your monthly review, or fill in learnings, challenges faced or next month's plan.",
      });
    }
  });

// ============================================
// Team Schema
// ============================================

/**
 * Team selection schema
 */
export const teamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
});

// ============================================
// Derived Types
// ============================================

export type MonthlyReviewFormValues = z.infer<typeof monthlyReviewSchema>;
export type TeamFormValues = z.infer<typeof teamSchema>;
