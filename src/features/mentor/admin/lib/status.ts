/**
 * Mentor application status → display.
 *
 * 📍 src/features/mentor/admin/lib/status.ts
 */
import {
  MENTOR_STATUSES,
  type MentorAdminStatus,
  type MentorApplicationListItem,
} from "../schemas";

type BadgeVariant = "success" | "destructive" | "warning" | "outline";
type StatusSource = Pick<
  MentorApplicationListItem,
  "status" | "is_verified" | "verification_note"
>;

const STATUS_BADGES: Record<
  MentorAdminStatus,
  { label: string; variant: BadgeVariant }
> = {
  PENDING: { label: "Pending", variant: "warning" },
  APPROVED: { label: "Approved", variant: "success" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  GRANT_REVOKED: { label: "Revoked", variant: "outline" },
};

/**
 * `status` is authoritative. The fallbacks cover older endpoints that only
 * sent `is_verified` / `verification_note`. Returns string, not the enum:
 * after a schema mismatch the client hands back raw data (api/client.ts), so
 * a status the frontend doesn't know yet can still arrive here.
 */
export function resolveStatus(m: StatusSource): string {
  if (m.status) return m.status;
  if (m.is_verified === true) return "APPROVED";
  return m.verification_note ? "REJECTED" : "PENDING";
}

export function statusBadge(status: string): {
  label: string;
  variant: BadgeVariant;
} {
  return (MENTOR_STATUSES as readonly string[]).includes(status)
    ? STATUS_BADGES[status as MentorAdminStatus]
    : { label: status, variant: "outline" };
}

/** Approve/Reject only make sense while an application awaits a decision. */
export function isActionable(m: StatusSource): boolean {
  return resolveStatus(m) === "PENDING";
}
