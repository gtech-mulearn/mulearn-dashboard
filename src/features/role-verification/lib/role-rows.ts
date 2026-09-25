/**
 * Client-side guard for single-role request tables.
 *
 * 📍 src/features/role-verification/lib/role-rows.ts
 *
 * UserVerificationAPI filters by ?role= (added 2026-09-25), but an older
 * backend silently ignores unknown params and returns every unverified link.
 * Mentor and Company links must never be approved from the Enabler tab —
 * their own flows grant scopes / verify the company — so rows for any other
 * role are dropped here even if the backend let them through.
 */
export function keepRequestsForRole<T extends { role_title: string }>(
  rows: T[],
  roleTitle: string,
): T[] {
  return rows.filter((row) => row.role_title === roleTitle);
}
