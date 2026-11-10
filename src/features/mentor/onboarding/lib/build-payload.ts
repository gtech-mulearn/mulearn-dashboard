import type { MentorProfileWrite, OnboardingFormValues } from "../schemas";

export interface BuildPayloadContext {
  /** Id of the application being edited (pending edit). */
  existingId?: string;
  isEdit: boolean;
  isReapply: boolean;
  isPendingEdit: boolean;
  /** Known organisations, used to resolve a reapply org typed as a name. */
  companies: ReadonlyArray<{ id: string; title: string }>;
  /** Colleges (Campus Mentor), resolved the same way. */
  colleges?: ReadonlyArray<{ id: string; title: string }>;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolve a reapply org that was saved as a display name back to its id —
 * among colleges for a Campus Mentor, among companies otherwise.
 */
function resolveOrg(
  org: string | undefined,
  tier: string | undefined,
  ctx: BuildPayloadContext,
): string | undefined {
  if (!org || !ctx.isReapply || UUID_RE.test(org)) return org || undefined;
  const pool = tier === "CAMPUS_MENTOR" ? (ctx.colleges ?? []) : ctx.companies;
  const match = pool.find((c) => c.title.toLowerCase() === org.toLowerCase());
  return match?.id;
}

/**
 * Wire payload for POST/PATCH `mentor/register/`.
 *
 * - `expertise` chips are joined into the comma string the backend stores.
 * - `company` is display-only; the API takes `org` (the organisation id).
 * - `linkedin_url` is sent as `linkedin`.
 * - `hours` is sent only when a range was picked: the backend accepts a range
 *   or nothing, and rejects `0`.
 * - Editing a pending application cannot change its tier or organisation.
 */
export function buildMentorApplicationPayload(
  values: OnboardingFormValues,
  ctx: BuildPayloadContext,
): MentorProfileWrite & { id?: string } {
  const {
    company: _company,
    linkedin_url,
    hours,
    org,
    mentor_tier,
    ...rest
  } = values;

  const payload: MentorProfileWrite & { id?: string } = {
    ...rest,
    expertise: (values.expertise ?? []).join(", "),
  };

  if (ctx.isEdit && !ctx.isReapply && ctx.existingId) {
    payload.id = ctx.existingId;
  }
  if (linkedin_url) payload.linkedin = linkedin_url;
  if (hours) payload.hours = hours;

  if (!ctx.isPendingEdit) {
    if (mentor_tier) payload.mentor_tier = mentor_tier;
    const resolvedOrg = resolveOrg(org, mentor_tier, ctx);
    if (resolvedOrg) payload.org = resolvedOrg;
  }

  return payload;
}
