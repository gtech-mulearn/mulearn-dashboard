import { ApiError } from "@/api/errors";

/** utils.permission.mentor_active_required (release 1.91). */
export const MENTOR_DEACTIVATED_MESSAGE =
  "Your mentor account is deactivated. Please contact an administrator.";

/** True for the 403 a deactivated mentor gets from mentor endpoints. */
export function isMentorDeactivatedError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 403 &&
    error.message.trim() === MENTOR_DEACTIVATED_MESSAGE
  );
}
