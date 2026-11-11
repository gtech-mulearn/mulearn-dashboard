"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  deactivateCompanySelf,
  fetchCompanyAdminLinks,
  fetchMyCompanyInvitations,
  inviteCompanyAdmin,
  leaveCompanyAdmin,
  removeCompanyAdmin,
  respondCompanyAdminInvitation,
} from "../api";
import { COMPANY_KEYS } from "./use-company-profile";

export const COMPANY_ADMIN_LINK_KEYS = {
  all: ["company-admin-links"] as const,
  list: () => [...COMPANY_ADMIN_LINK_KEYS.all, "list"] as const,
  invitations: () => [...COMPANY_ADMIN_LINK_KEYS.all, "invitations"] as const,
};

export function useCompanyAdminLinks() {
  return useQuery({
    queryKey: COMPANY_ADMIN_LINK_KEYS.list(),
    queryFn: fetchCompanyAdminLinks,
    refetchOnWindowFocus: false,
  });
}

/** Pending invitations addressed to the signed-in user (BE-1). */
export function useMyCompanyInvitations(enabled = true) {
  return useQuery({
    queryKey: COMPANY_ADMIN_LINK_KEYS.invitations(),
    queryFn: fetchMyCompanyInvitations,
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

/** Owner withdraws a pending invite (BE-2: the revoke endpoint). */
export function useCancelCompanyAdminInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) => removeCompanyAdmin(linkId),
    onSuccess: () => {
      toast.success("Invitation cancelled");
      queryClient.invalidateQueries({
        queryKey: COMPANY_ADMIN_LINK_KEYS.list(),
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to cancel invitation" }),
      );
    },
  });
}

export function useInviteCompanyAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (muid: string) => inviteCompanyAdmin(muid),
    onSuccess: () => {
      toast.success("Invitation sent. They'll get access once they accept.");
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
        variables.accept ? "Invitation accepted" : "Invitation declined",
      );
      queryClient.invalidateQueries({ queryKey: COMPANY_ADMIN_LINK_KEYS.all });
      // Accepting makes the user a co-admin: refresh company access.
      queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.all });
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
      toast.success("Co-admin removed");
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
      toast.success("You've left the company");
      queryClient.invalidateQueries({ queryKey: COMPANY_ADMIN_LINK_KEYS.all });
      // The user is no longer a co-admin: refresh company access.
      queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.all });
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
