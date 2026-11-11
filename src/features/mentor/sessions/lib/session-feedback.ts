export type SessionRating = 1 | 2 | 3 | 4 | 5;

/** Body for PATCH session/participant/feedback/<session_id>/. */
export interface SessionFeedbackBody {
  feedback?: string;
  rating?: SessionRating;
}

/**
 * The backend needs at least one of feedback/rating and rejects an empty
 * feedback string, so empty values are left out instead of sent blank.
 */
export interface SessionFeedbackInput {
  feedback?: string | null;
  rating?: SessionRating | null;
}

export function buildSessionFeedbackBody(
  input: SessionFeedbackInput,
): SessionFeedbackBody {
  const body: SessionFeedbackBody = {};
  const feedback = input.feedback?.trim();
  if (feedback) body.feedback = feedback;
  if (input.rating) body.rating = input.rating;
  return body;
}
