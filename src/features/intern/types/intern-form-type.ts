/**
 * Intern Form Feature Types
 *
 * 📍 src/features/intern-form/types/intern-form-type.ts
 *
 * TypeScript interfaces for intern form related entities.
 */

/**
 * Standard API response wrapper
 */
export interface TApiResponse<T> {
  hasError: boolean;
  statusCode: number;
  message?: Record<string, string[]>;
  response: T;
}

/**
 * Weekly review form submission data
 */
export interface TWeeklyReviewForm {
  fullName: string;
  muid: string;
  email: string;
  team: string;
  tasksAssigned: string;
  tasksCompleted: string;
  worksDone: string;
  hoursCommitted: string;
  blockers: string;
  leaveDays: string;
  weeklyReview: string;
}

/**
 * Team selection options
 */
export interface TTeam {
  id: string;
  name: string;
}

/**
 * Weekly review submission result
 */
export interface TWeeklyReviewResult {
  id: string;
  submittedAt: string;
}

/**
 * API Response types
 */
export type TWeeklyReviewResponse = TApiResponse<TWeeklyReviewResult>;
