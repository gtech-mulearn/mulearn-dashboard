"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { endpoints } from "@/api/endpoints";
import { authStore } from "@/lib/auth";
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
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadCsv = useCallback(async () => {
    const token = authStore.getAccessToken();
    if (!token) {
      throw new Error("Please login again to download CSV");
    }

    setIsDownloading(true);
    try {
      const base = process.env.NEXT_PUBLIC_DJANGO_API_URL;
      const response = await fetch(base ? `${base}${csvPath}` : csvPath, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download CSV");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "role-verification.csv";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  }, [csvPath]);

  return {
    downloadCsv,
    isDownloading,
  };
}
