"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { endpoints } from "@/api/endpoints";
import { useCsvDownload } from "@/hooks/use-csv-download";
import {
  deleteRoleVerification,
  fetchRoleVerifications,
  updateRoleVerification,
} from "../api/role-verification.api";

export type RoleVerificationListParams = {
  pageIndex: number;
  perPage: number;
  search?: string;
  sortBy?: string;
};

export const ROLE_VERIFICATION_KEYS = {
  all: ["role-verifications"] as const,
  list: (params: RoleVerificationListParams) =>
    [...ROLE_VERIFICATION_KEYS.all, "list", params] as const,
};

export function useRoleVerifications(params: RoleVerificationListParams) {
  return useQuery({
    queryKey: ROLE_VERIFICATION_KEYS.list(params),
    queryFn: () => fetchRoleVerifications(params),
  });
}

export function useVerifyRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => updateRoleVerification(id, true),
    onSuccess: () => {
      toast.success("Role verified successfully");
      queryClient.invalidateQueries({
        queryKey: ROLE_VERIFICATION_KEYS.all,
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to verify role");
    },
  });
}

export function useDeleteRoleVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRoleVerification(id),
    onSuccess: () => {
      toast.success("Role verification request deleted");
      queryClient.invalidateQueries({
        queryKey: ROLE_VERIFICATION_KEYS.all,
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete request");
    },
  });
}

export function useRoleVerificationCsvDownload(
  csvPath: string = endpoints.admin.roleVerification.csv,
) {
  return useCsvDownload(csvPath, "role-verification.csv");
}
