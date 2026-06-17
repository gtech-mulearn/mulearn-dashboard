"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  createRole,
  deleteRole,
  downloadRolesCsvBlob,
  fetchRoles,
  updateRole,
} from "../api/manage-roles.api";
import type { RoleFormValues } from "../schemas";
import { manageRolesKeys } from "./query-keys";

interface UseRolesListParams {
  pageIndex: number;
  perPage: number;
  search: string;
  sortBy: string;
}

export function useRolesList(params: UseRolesListParams) {
  return useQuery({
    queryKey: manageRolesKeys.list(params),
    queryFn: () => fetchRoles(params),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RoleFormValues) => createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manageRolesKeys.lists() });
      toast.success("Role created successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to create role" }),
      );
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RoleFormValues }) =>
      updateRole(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manageRolesKeys.lists() });
      toast.success("Role updated successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update role" }),
      );
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manageRolesKeys.lists() });
      toast.success("Role deleted successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to delete role" }),
      );
    },
  });
}

export function useRolesCsvDownload() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadCsv = useCallback(async () => {
    setIsDownloading(true);
    try {
      await downloadRolesCsvBlob();
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return { downloadCsv, isDownloading };
}
