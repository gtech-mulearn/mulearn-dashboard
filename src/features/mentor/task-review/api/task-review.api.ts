// ─── Task Review API ──────────────────────────────────────────────────────────
// NOTE: The review-queue endpoints (/mentor/review-queue/...) are NOT part of
// the 22 documented mentor APIs. These stubs return empty data so that the
// feature continues to compile while the alternate API is being wired up.
// ─────────────────────────────────────────────────────────────────────────────

import type { ReviewActionValues, ReviewItem } from "../schemas";

// #stub – no documented endpoint exists for the review queue yet
export async function fetchReviewQueue(
  _params: { status?: string; page?: number; search?: string } = {},
): Promise<{ data: ReviewItem[]; totalPages: number }> {
  return { data: [], totalPages: 1 };
}

// #stub – no documented endpoint exists for a single review submission yet
export async function fetchReviewSubmission(
  _kalId: string,
): Promise<ReviewItem> {
  throw new Error("fetchReviewSubmission: endpoint not yet available");
}

// #stub – no documented endpoint exists for submitting a review yet
export async function reviewItem(
  _kalId: string,
  _data: ReviewActionValues,
): Promise<void> {
  throw new Error("reviewItem: endpoint not yet available");
}
