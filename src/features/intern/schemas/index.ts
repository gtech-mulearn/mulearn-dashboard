/**
 * Intern Form Schemas
 *
 * 📍 src/features/intern-form/schemas/index.ts
 *
 * Barrel export for all schemas.
 */

export type {
  MonthlyReviewFormValues,
  TeamFormValues,
} from "./intern-form-schema";
export {
  MONTHLY_REVIEW_FIELD_MAX,
  MONTHLY_REVIEW_TEXT_MAX,
  monthlyReviewSchema,
  teamSchema,
} from "./intern-form-schema";
