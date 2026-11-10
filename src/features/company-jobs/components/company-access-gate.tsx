"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useCompanyAccess } from "../hooks/use-company-access";
import {
  type CompanyCapability,
  canOpenCompanyPage,
} from "../lib/company-access";
import { CompanyInvitationsPanel } from "./admin/company-invitations-panel";
import {
  CompanyForbiddenState,
  CompanyNoAccessState,
  CompanyPageSkeleton,
} from "./company-access-states";

interface CompanyAccessGateProps {
  children: ReactNode;
  /**
   * Capability the page needs. Defaults to the rule for the current
   * /dashboard/company section (see canOpenCompanyPage).
   */
  capability?: CompanyCapability;
}

/**
 * Lets owners, co-admins and company mentors into company pages according to
 * what their role can do, and says why when it can't. The route itself is open
 * to every signed-in user because only the owner holds the Company role.
 */
export function CompanyAccessGate({
  children,
  capability,
}: CompanyAccessGateProps) {
  const pathname = usePathname();
  const { role, can, isLoading } = useCompanyAccess();

  if (isLoading) return <CompanyPageSkeleton />;
  // Invitees land here from the invite notification: let them accept.
  if (!role) {
    return <CompanyNoAccessState invitations={<CompanyInvitationsPanel />} />;
  }

  const allowed = capability
    ? can[capability]
    : canOpenCompanyPage(pathname, role);
  if (!allowed) return <CompanyForbiddenState role={role} />;

  return <>{children}</>;
}
