"use client";

import { useQuery } from "@tanstack/react-query";
import { usePermissions } from "@/hooks/use-permissions";
import {
  COMPANY_CAPABILITIES,
  type CompanyAccessRole,
  type CompanyCapabilities,
  NO_COMPANY_CAPABILITIES,
  resolveCompanyAccess,
} from "@/lib/auth/company-access";
import { ROLES } from "@/lib/auth/roles";
import {
  probeCompanyAdminAccess,
  probeCompanyMembership,
} from "../api/jobs.api";

const ACCESS_KEYS = {
  membership: ["company", "access", "membership"] as const,
  admin: ["company", "access", "admin"] as const,
};

// Membership changes rarely (an invite accepted, a grant revoked); one probe
// per half hour keeps the nav correct without a request on every page.
const PROBE_STALE_TIME = 30 * 60 * 1000;

export interface CompanyAccess {
  role: CompanyAccessRole | null;
  can: CompanyCapabilities;
  isLoading: boolean;
}

/**
 * The signed-in user's relationship to a company: owner (Company role),
 * accepted co-admin, or company mentor. Owners are known from the token; for
 * everyone else two cached probes answer it (see @/lib/auth/company-access).
 */
export function useCompanyAccess(): CompanyAccess {
  const { roles, hasRole, isLoading: rolesLoading } = usePermissions();
  const signedIn = roles.length > 0;
  const isOwner = hasRole([ROLES.COMPANY]);

  const membership = useQuery({
    queryKey: ACCESS_KEYS.membership,
    queryFn: probeCompanyMembership,
    enabled: signedIn && !isOwner,
    staleTime: PROBE_STALE_TIME,
    retry: false,
  });

  const admin = useQuery({
    queryKey: ACCESS_KEYS.admin,
    queryFn: probeCompanyAdminAccess,
    enabled: signedIn && !isOwner && membership.data === true,
    staleTime: PROBE_STALE_TIME,
    retry: false,
  });

  const role = resolveCompanyAccess({
    hasCompanyRole: isOwner,
    hasCompanyProfile: membership.data === true,
    canListAdminLinks: admin.data === true,
  });

  // A member whose admin probe is still running would briefly look like a
  // company mentor; report nothing until the probes settle.
  const settling =
    !isOwner &&
    (rolesLoading ||
      membership.isLoading ||
      (membership.data === true && admin.isLoading));
  const settledRole = settling ? null : role;

  return {
    role: settledRole,
    can: settledRole
      ? COMPANY_CAPABILITIES[settledRole]
      : NO_COMPANY_CAPABILITIES,
    isLoading: isOwner ? rolesLoading : settling,
  };
}
