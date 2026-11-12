import type { CompanyAccessRole } from "@/lib/auth/company-access";
import type { CompanyAdminLink } from "../types";

/** Backend cap on accepted + pending co-admin links per company. */
export const MAX_COMPANY_CO_ADMINS = 5;

export interface AdminLinkViewer {
  role: CompanyAccessRole | null;
  muid: string | null;
}

export interface AdminLinkActions {
  canRemove: boolean;
  canLeave: boolean;
  /** Owner withdraws a pending invite (BE-2). */
  canCancel: boolean;
}

/**
 * Row actions on the co-admin list, mirroring the backend: Accepted links
 * can be revoked (by the owner) or left (by that co-admin); the owner can
 * cancel a Pending invite.
 */
export function adminLinkActions(
  link: CompanyAdminLink,
  viewer: AdminLinkViewer,
): AdminLinkActions {
  if (link.status === "Pending") {
    return {
      canRemove: false,
      canLeave: false,
      canCancel: viewer.role === "owner",
    };
  }
  if (link.status !== "Accepted") {
    return { canRemove: false, canLeave: false, canCancel: false };
  }
  const isOwnLink =
    !!viewer.muid && link.user_muid.toLowerCase() === viewer.muid.toLowerCase();
  return {
    canRemove: viewer.role === "owner",
    canLeave: viewer.role === "co_admin" && isOwnLink,
    canCancel: false,
  };
}

/** Seats used by accepted co-admins and outstanding invites. */
export function coAdminSeats(links: CompanyAdminLink[]): {
  used: number;
  left: number;
  max: number;
} {
  const used = links.filter(
    (l) => l.status === "Accepted" || l.status === "Pending",
  ).length;
  return {
    used,
    left: Math.max(0, MAX_COMPANY_CO_ADMINS - used),
    max: MAX_COMPANY_CO_ADMINS,
  };
}
