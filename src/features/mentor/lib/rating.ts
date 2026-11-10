/**
 * "4.5 (12)" for a mentor's average session rating, or null until at least
 * one mentee has rated (MentorDetailSerializer avg_rating / rating_count).
 */
export function formatMentorRating(
  avgRating: number | null | undefined,
  ratingCount: number | null | undefined,
): string | null {
  if (!ratingCount || ratingCount <= 0 || avgRating == null) return null;
  return `${avgRating.toFixed(1)} (${ratingCount})`;
}
