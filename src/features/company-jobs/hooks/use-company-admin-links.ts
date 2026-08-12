"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  deactivateCompanySelf,
  fetchCompanyAdminLinks,
  fetchUserCompanyStatus,
  inviteCompanyAdmin,
  leaveCompanyAdmin,
  removeCompanyAdmin,
  respondCompanyAdminInvitation,
} from "../api";

export const COMPANY_ADMIN_LINK_KEYS = {
  all: ["company-admin-links"] as const,
  list: () => [...COMPANY_ADMIN_LINK_KEYS.all, "list"] as const,
  status: () => [...COMPANY_ADMIN_LINK_KEYS.all, "status"] as const,
};

export function useCompanyAdminLinks() {
  return useQuery({
    queryKey: COMPANY_ADMIN_LINK_KEYS.list(),
    queryFn: fetchCompanyAdminLinks,
    refetchOnWindowFocus: false,
  });
}

export function useUserCompanyStatus() {
  return useQuery({
    queryKey: COMPANY_ADMIN_LINK_KEYS.status(),
    queryFn: fetchUserCompanyStatus,
    refetchOnWindowFocus: false,
  });
}

export function useInviteCompanyAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => inviteCompanyAdmin(email),
    onSuccess: () => {
      toast.success("Co-admin invitation sent successfully");
      queryClient.invalidateQueries({
        queryKey: COMPANY_ADMIN_LINK_KEYS.list(),
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to send invitation" }),
      );
    },
  });
}

export function useRespondCompanyAdminInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ linkId, accept }: { linkId: string; accept: boolean }) =>
      respondCompanyAdminInvitation(linkId, accept),
    onSuccess: (_, variables) => {
      toast.success(
        variables.accept ? "Invitation accepted" : "Invitation rejected",
      );
      queryClient.invalidateQueries({ queryKey: COMPANY_ADMIN_LINK_KEYS.all });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to respond to invitation",
        }),
      );
    },
  });
}

export function useRemoveCompanyAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) => removeCompanyAdmin(linkId),
    onSuccess: () => {
      toast.success("Co-admin removed successfully");
      queryClient.invalidateQueries({
        queryKey: COMPANY_ADMIN_LINK_KEYS.list(),
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to remove co-admin" }),
      );
    },
  });
}

export function useLeaveCompanyAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) => leaveCompanyAdmin(linkId),
    onSuccess: () => {
      toast.success("Left company admin role");
      queryClient.invalidateQueries({ queryKey: COMPANY_ADMIN_LINK_KEYS.all });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to leave company admin",
        }),
      );
    },
  });
}

export function useDeactivateCompanySelf() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateCompanySelf,
    onSuccess: () => {
      toast.success("Company deactivated successfully");
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to deactivate company",
        }),
      );
    },
  });
}
