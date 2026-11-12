"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  extractInterestGroups,
  useInterestGroupsList,
} from "@/features/interest-groups";
import { usePermissions } from "@/hooks/use-permissions";
import { hasIgLeadRole, ROLES } from "@/lib/auth/roles";
import { type LeadTarget, leadTargets } from "../lib/lead-targets";

/** campus-details/ → the campus lead's own campus (org id + name). */
async function fetchLeadCampus(): Promise<{
  orgId: string;
  name: string;
} | null> {
  const data = await apiClient.get<Record<string, unknown>>(
    endpoints.campusManage.details,
    undefined,
    { skipAuthRedirectOn403: true },
  );
  const orgId = typeof data?.org_id === "string" ? data.org_id : "";
  if (!orgId) return null;
  const name =
    typeof data?.college_name === "string" ? data.college_name : "Your campus";
  return { orgId, name };
}

/** Campuses and IGs the signed-in lead can claim or answer for. */
export function useLeadTargets(): {
  targets: LeadTarget[];
  isLoading: boolean;
} {
  const { roles } = usePermissions();
  const isCampusLead = roles.includes(ROLES.CAMPUS_LEAD);
  const isIgLead = hasIgLeadRole(roles);
  const campus = useQuery({
    queryKey: ["collaborations", "lead-campus"],
    queryFn: fetchLeadCampus,
    enabled: isCampusLead,
    retry: false,
    staleTime: 10 * 60 * 1000,
  });
  const igs = useInterestGroupsList(undefined, { enabled: isIgLead });
  return {
    targets: leadTargets(roles, {
      campus: campus.data ?? null,
      igs: igs.data ? extractInterestGroups(igs.data) : [],
    }),
    isLoading:
      (isCampusLead && campus.isLoading) || (isIgLead && igs.isLoading),
  };
}
