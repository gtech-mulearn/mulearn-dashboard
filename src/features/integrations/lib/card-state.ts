import type { PartnerConnection } from "../schemas";

export type CardState =
  | "hidden"
  | "unavailable"
  | "read_only"
  | "not_connected"
  | "consented"
  | "active"
  | "pending"
  | "blocked"
  | "rejected"
  | "needs_consent"
  | "takeover"
  | "disconnected";

const READ_ONLY_REASONS = new Set(["not_owner", "not_lead_enabler"]);

/** Spec B §3.9: the most specific state wins (takeover → terms → link status). */
export function cardState(connection: PartnerConnection): CardState {
  if (!connection.enabled || connection.hidden) return "hidden";
  if (!connection.can_manage) {
    return READ_ONLY_REASONS.has(connection.eligibility?.reason ?? "")
      ? "read_only"
      : "unavailable";
  }
  if (connection.eligibility && !connection.eligibility.eligible) {
    return "unavailable";
  }
  const link = connection.connection;
  if (!link) return "not_connected";
  if (link.takeover_required) return "takeover";
  if (link.status === "disconnected") return "disconnected";
  if (connection.consent?.needs_consent) return "needs_consent";
  if (link.status === "pending_approval") return "pending";
  return link.status;
}
