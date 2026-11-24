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
 * Team selection options
 */
export interface TTeam {
  id: string;
  name: string;
}
