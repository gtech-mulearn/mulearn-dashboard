/**
 * Intern Form Feature Schemas
 *
 * 📍 src/features/intern-form/schemas/intern-form-schema.ts
 *
 * Zod schemas for form validation.
 */

import { z } from "zod";

// ============================================
// Weekly Review Schema
// ============================================

/**
 * Weekly review form validation schema
 */
const baseWeeklyReviewSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  muid: z.string().min(1, "MUID is required"),
  email: z.string().email("Invalid email address"),
  team: z.string().min(1, "Team is required"),
  isOnLeave: z.boolean(),
  tasksAssigned: z.string().optional(),
  tasksCompleted: z.string().optional(),
  worksDone: z.string().optional(),
  hoursCommitted: z.string().optional(),
  blockers: z.string().optional(),
  leaveDays: z.string().optional(),
  rating: z.string().optional(),
  learnings: z.string().optional(),
  challengesFaced: z.string().optional(),
  nextWeekPlan: z.string().optional(),
  suggestions: z.string().optional(),
});

export const weeklyReviewSchema = baseWeeklyReviewSchema.superRefine(
  (data, ctx) => {
    if (!data.isOnLeave) {
      if (!data.tasksAssigned) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Tasks assigned are required",
          path: ["tasksAssigned"],
        });
      }
      if (!data.tasksCompleted) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Tasks completed are required",
          path: ["tasksCompleted"],
        });
      }
      if (!data.worksDone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Works done are required",
          path: ["worksDone"],
        });
      }
      if (
        data.hoursCommitted === undefined ||
        data.hoursCommitted === null ||
        data.hoursCommitted.trim() === ""
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Hours committed is required",
          path: ["hoursCommitted"],
        });
      } else {
        const num = Number(data.hoursCommitted);
        if (Number.isNaN(num) || num < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Hours must be a positive number",
            path: ["hoursCommitted"],
          });
        }
      }
    }
  },
);

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

export type WeeklyReviewFormValues = z.infer<typeof weeklyReviewSchema>;
export type TeamFormValues = z.infer<typeof teamSchema>;
