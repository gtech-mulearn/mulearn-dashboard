/**
 * Meet-Link Validation Utilities
 *
 * 📍 src/features/learning-circle/utils/meet-link-validation.ts
 *
 * Single source of truth for the "meeting link must match the selected
 * platform" rule (BUG-015).
 *
 * ─── Why a shared util? ──────────────────────────────────────────────────────
 * Mirrors the BUG-011 pattern established by meet-time-validation.ts.
 * The domain rules are enforced at two Zod layers:
 *   1. CreateMeetingRequestSchema  (schemas/meeting.schema.ts)
 *      — catches any code path that builds a CreateMeetingRequest object.
 *   2. CreateMeetingFormSchema / buildEditMeetingSchema (modal components)
 *      — gives the user immediate, field-level feedback before the API call.
 *
 * Keeping the rules here means a new platform or domain variant is a single-
 * line edit — not a multi-file search-and-replace.
 *
 * ─── Security note ───────────────────────────────────────────────────────────
 * Frontend validation is UX-only. The Django backend MUST independently
 * validate platform/link consistency server-side so it cannot be bypassed via
 * direct API calls (BUG-015 backend ticket).
 *
 * ─── URL parsing ─────────────────────────────────────────────────────────────
 * We use the browser-standard `URL` constructor.  It handles:
 *   • http:// vs https://
 *   • trailing slashes
 *   • query params and fragments
 *   • mixed-case hostnames (we always compare lowercased)
 * An invalid URL string causes `new URL()` to throw; we catch that and return
 * false (not a valid link for any platform).
 */

/** All platforms the app currently supports for online meetings. */
export type MeetingPlatform =
  | "Zoom"
  | "Google Meet"
  | "Microsoft Teams"
  | "Discord";

/**
 * Domain validation rule for a single platform.
 *
 * @param hostname - The lowercased `hostname` from `new URL(link)`.
 * @returns true if this hostname is valid for the platform.
 */
type DomainMatcher = (hostname: string) => boolean;

/**
 * Per-platform domain matchers.
 *
 * ┌──────────────────────┬──────────────────────────────────────────────────┐
 * │ Platform             │ Valid hostnames                                   │
 * ├──────────────────────┼──────────────────────────────────────────────────┤
 * │ Zoom                 │ *.zoom.us  (vanity: company.zoom.us, zoom.us)    │
 * │ Google Meet          │ meet.google.com                                  │
 * │ Microsoft Teams      │ teams.microsoft.com  OR  teams.live.com          │
 * │ Discord              │ discord.com  OR  discord.gg                      │
 * └──────────────────────┴──────────────────────────────────────────────────┘
 */
export const PLATFORM_DOMAIN_RULES: Record<MeetingPlatform, DomainMatcher> = {
  Zoom: (h) => h === "zoom.us" || h.endsWith(".zoom.us"),
  "Google Meet": (h) => h === "meet.google.com",
  "Microsoft Teams": (h) =>
    h === "teams.microsoft.com" || h === "teams.live.com",
  Discord: (h) => h === "discord.com" || h === "discord.gg",
};

/**
 * Placeholders for the Meeting Link input field, dynamically changing based
 * on the selected platform.
 */
export const PLATFORM_LINK_PLACEHOLDERS: Record<MeetingPlatform, string> = {
  Zoom: "https://zoom.us/j/123456789",
  "Google Meet": "https://meet.google.com/abc-defg-hij",
  "Microsoft Teams": "https://teams.microsoft.com/l/meetup-join/...",
  Discord: "https://discord.gg/abc123",
};

/**
 * Returns `true` when `link` is a valid meeting URL for `platform`.
 *
 * Rules:
 *  - When `platform` is `null` / `undefined` (offline mode), always returns
 *    `true` — `meet_place` is a free-text location string, not a URL.
 *  - When `link` is empty / not a valid URL, returns `false`.
 *  - Otherwise delegates to the per-platform `DomainMatcher`.
 *
 * @param platform - The selected meeting platform, or null for offline.
 * @param link     - The raw string the user typed into the link field.
 */
export function isMeetLinkValidForPlatform(
  platform: MeetingPlatform | null | undefined,
  link: string | null | undefined,
): boolean {
  // Offline or no platform selected — skip link validation entirely.
  if (!platform) return true;

  // Empty / falsy link — always invalid when a platform is selected.
  if (!link || link.trim() === "") return false;

  let hostname: string;
  try {
    hostname = new URL(link.trim()).hostname.toLowerCase();
  } catch {
    // URL constructor throws for non-URL strings (e.g. "room 101").
    return false;
  }

  // An empty hostname means the URL had no host (e.g. a bare "data:" URI).
  if (!hostname) return false;

  const matcher = PLATFORM_DOMAIN_RULES[platform];
  if (!matcher) return false;
  return matcher(hostname);
}

/**
 * Human-readable validation error shown under the Meeting Link field.
 *
 * @param platform - The platform that was selected.
 */
export function getMeetLinkErrorMessage(
  platform: MeetingPlatform | null | undefined,
): string {
  if (!platform) return "Please enter a valid meeting link.";

  const examples: Record<MeetingPlatform, string> = {
    Zoom: "zoom.us",
    "Google Meet": "meet.google.com",
    "Microsoft Teams": "teams.microsoft.com or teams.live.com",
    Discord: "discord.com or discord.gg",
  };

  const expected = examples[platform];
  return `This doesn't look like a valid ${platform} link. Please use a link from ${expected}.`;
}
