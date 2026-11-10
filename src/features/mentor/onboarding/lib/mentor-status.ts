/**
 * Mentor application status across ALL of a user's applications.
 *
 * Since release 1.91 a mentor has one profile but can hold several
 * applications (IG / campus / company tiers, plus change requests such as
 * "change company" or "change IGs", which create a new PENDING application).
 * GET mentor/status/ returns all of them, newest first. A user is a verified
 * mentor when ANY application is approved — a newer pending request must not
 * hide that (it used to drop the mentor nav and show "pending verification").
 */

export type MentorApplicationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "GRANT_REVOKED";

export interface MentorApplicationSummary {
  id: string;
  status: MentorApplicationStatus;
  mentor_tier: string | null;
  organization: string | null;
  created_at: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
}

export type MentorStatusData = {
  /** Overall state: APPROVED if any application is approved. */
  status: "PENDING" | "APPROVED" | "REJECTED";
  verification_note?: string | null;
  rejection_reason?: string | null;
  mentor_id?: string | null;
  /** Application to act on: the pending one if any, else the newest. */
  id?: string | null;
  // Mentor's affiliated organization, shown in the mentor profile sidebar.
  organization?: string | null;
  // Mentor tier of the application `id` refers to.
  mentor_tier?: string | null;
  applications: MentorApplicationSummary[];
  approvedApplications: MentorApplicationSummary[];
  pendingApplication: MentorApplicationSummary | null;
};

const REVOKED_MESSAGE = "Your mentor access was revoked.";

const TIER_LABELS: Record<string, string> = {
  IG_MENTOR: "IG Mentor",
  CAMPUS_MENTOR: "Campus Mentor",
  COMPANY_MENTOR: "Company Mentor",
  MENTOR: "Mentor",
};

/** "COMPANY_MENTOR" → "Company Mentor"; unknown or missing → "mentor". */
export function mentorTierLabel(tier: string | null | undefined): string {
  return (tier && TIER_LABELS[tier]) || "mentor";
}

function str(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null;
}

function toStatus(value: unknown): MentorApplicationStatus {
  const upper = typeof value === "string" ? value.toUpperCase() : "";
  return upper === "APPROVED" ||
    upper === "REJECTED" ||
    upper === "GRANT_REVOKED"
    ? upper
    : "PENDING";
}

function toSummary(item: Record<string, unknown>): MentorApplicationSummary {
  return {
    id: str(item.id) ?? str(item.mentor_id) ?? "",
    status: toStatus(item.status),
    mentor_tier: str(item.mentor_tier),
    organization: str(item.organization),
    created_at: str(item.created_at),
    verified_at: str(item.verified_at),
    rejection_reason: str(item.rejection_reason) ?? str(item.verification_note),
  };
}

/** Newest first by created_at; items without a date keep their place. */
function newestFirst(
  apps: MentorApplicationSummary[],
): MentorApplicationSummary[] {
  return [...apps].sort((a, b) =>
    a.created_at && b.created_at ? b.created_at.localeCompare(a.created_at) : 0,
  );
}

export function aggregateMentorStatus(raw: unknown): MentorStatusData {
  const items = (Array.isArray(raw) ? raw : raw ? [raw] : []).filter(
    (item): item is Record<string, unknown> =>
      Boolean(item) && typeof item === "object",
  );
  const applications = newestFirst(items.map(toSummary));
  const approvedApplications = applications.filter(
    (a) => a.status === "APPROVED",
  );
  const pendingApplication =
    applications.find((a) => a.status === "PENDING") ?? null;
  const newest = applications[0];
  const target = pendingApplication ?? newest;

  let status: MentorStatusData["status"] = "PENDING";
  let rejectionReason: string | null = null;
  if (approvedApplications.length > 0) {
    status = "APPROVED";
  } else if (newest?.status === "REJECTED") {
    status = "REJECTED";
    rejectionReason = newest.rejection_reason;
  } else if (newest?.status === "GRANT_REVOKED") {
    status = "REJECTED";
    rejectionReason = newest.rejection_reason ?? REVOKED_MESSAGE;
  }

  const legacy = items[0];
  return {
    status,
    verification_note: legacy ? str(legacy.verification_note) : null,
    rejection_reason: rejectionReason,
    mentor_id: legacy ? str(legacy.mentor_id) : null,
    id: target?.id || null,
    organization: target?.organization ?? null,
    mentor_tier: target?.mentor_tier ?? null,
    applications,
    approvedApplications,
    pendingApplication,
  };
}

/**
 * The application a profile view should show: the most recently updated
 * APPROVED one, otherwise the most recently updated one. The profile's
 * `applications` list has no guaranteed order, so array position means nothing.
 */
export function pickPrimaryApplication<
  T extends {
    status?: string | null;
    updated_at?: string | null;
    created_at?: string | null;
  },
>(apps: T[]): T | undefined {
  const stamp = (app: T) => app.updated_at ?? app.created_at ?? "";
  const latest = (list: T[]) =>
    list.reduce<T | undefined>(
      (best, app) => (!best || stamp(app) > stamp(best) ? app : best),
      undefined,
    );
  const approved = apps.filter(
    (app) => (app.status ?? "").toUpperCase() === "APPROVED",
  );
  return latest(approved.length > 0 ? approved : apps);
}
