/**
 * Return-Path Sanitiser
 *
 * 📍 src/lib/auth/return-path.ts
 *
 * Single source of truth for validating the `ruri` ("return URI") value that
 * carries a user back to where they were headed after an auth detour.
 *
 * `ruri` is attacker-controllable (it is just a query param on /login), so the
 * PATH is validated against an allowlist before we ever redirect to it.
 *
 * The QUERY STRING is preserved. That matters for OAuth returns: the Discord
 * callback lands on /dashboard/connect-discord?code=… and if a detour through
 * the auth recovery flow drops `?code=`, the page renders its idle state and
 * the connection silently never happens. Discord codes are single-use and
 * short-lived, so a dropped code cannot be replayed.
 *
 * Pure TS with no Node/edge-specific imports — safe to use from the edge proxy,
 * route handlers, and client components alike.
 */

const FALLBACK = "dashboard";

/** First path segments a return path is allowed to point at. */
const ALLOWED_PATH_PREFIX = [
  "dashboard",
  "profile",
  "callback",
  "login",
  "register",
  "onboarding",
];

/** Longest `ruri` we will even consider, to bound the work done here. */
const MAX_LENGTH = 2048;

function hasControlChars(value: string): boolean {
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}

/**
 * Validate a raw `ruri` value and return a path (no leading slash) that is safe
 * to redirect to, preserving its query string. Returns `"dashboard"` whenever
 * the input is not a path we recognise.
 *
 * @example
 * sanitizeReturnPath("dashboard/connect-discord?code=ABC")
 * // → "dashboard/connect-discord?code=ABC"
 * sanitizeReturnPath("https://evil.com") // → "dashboard"
 */
export function sanitizeReturnPath(raw: string): string {
  if (!raw || raw.length > MAX_LENGTH) return FALLBACK;

  // Normalise separators, then strip leading slashes so the value can only ever
  // be read as a path relative to our own origin — never as a host
  // ("//evil.com" would otherwise be a protocol-relative URL).
  const cleaned = raw.replace(/\\/g, "/").replace(/^\/+/, "");

  const queryIndex = cleaned.indexOf("?");
  const path = queryIndex === -1 ? cleaned : cleaned.slice(0, queryIndex);
  const rawQuery = queryIndex === -1 ? "" : cleaned.slice(queryIndex + 1);

  if (!ALLOWED_PATH_PREFIX.includes(path.split("/")[0])) return FALLBACK;
  // A scheme ("https:") or userinfo ("user@host") in the path means someone is
  // trying to point this off-origin.
  if (/[:@]/.test(path)) return FALLBACK;
  if (path.includes("..")) return FALLBACK;
  if (hasControlChars(path)) return FALLBACK;

  if (!rawQuery) return path;

  // Re-serialising through URLSearchParams normalises and percent-encodes the
  // query, which neutralises control characters (CR/LF header smuggling) while
  // leaving ordinary values like `code=ABC123` untouched.
  const query = new URLSearchParams(rawQuery).toString();
  return query ? `${path}?${query}` : path;
}
