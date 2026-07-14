"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { searchUsers } from "@/features/search";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  type AssignUserRolePayload,
  assignUserRole,
  type BulkAssignExtraPayload,
  bulkAssignFromExcel,
  bulkAssignRole,
  bulkRemoveRole,
  downloadBaseTemplate,
  fetchBulkRoleUsers,
  fetchUsersByRole,
  fetchUsersWithoutRole,
  removeUserRole,
} from "../api/manage-roles.api";
import { manageRolesKeys } from "./query-keys";

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useUsersByRole(roleId: string, search: string) {
  return useQuery({
    queryKey: manageRolesKeys.usersByRole(roleId, search),
    queryFn: () => fetchUsersByRole(roleId, search),
    enabled: Boolean(roleId),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useBulkRoleUsers(roleId: string) {
  return useQuery({
    queryKey: manageRolesKeys.bulkUsers(roleId),
    queryFn: () => fetchBulkRoleUsers(roleId),
    enabled: Boolean(roleId),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useUsersWithoutRole(roleId: string) {
  return useQuery({
    queryKey: manageRolesKeys.usersWithoutRole(roleId),
    queryFn: () => fetchUsersWithoutRole(roleId),
    enabled: Boolean(roleId),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useRoleUserSearch(query: string, limit = 30) {
  const isSearchActive = query.length >= 2;
  return useQuery({
    queryKey: [...manageRolesKeys.searchUsers(query), limit] as const,
    queryFn: () => searchUsers({ search: query, perPage: limit }),
    enabled: isSearchActive,
    staleTime: 30_000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useAssignUserRole(roleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignUserRolePayload) => assignUserRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...manageRolesKeys.all, "users-by-role", roleId],
      });
      queryClient.invalidateQueries({
        queryKey: manageRolesKeys.bulkUsers(roleId),
      });
      queryClient.invalidateQueries({
        queryKey: manageRolesKeys.usersWithoutRole(roleId),
      });
      toast.success("Role assigned");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to assign role" }),
      );
    },
  });
}

export function useRemoveUserRole(roleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { user_id: string; role_id: string }) =>
      removeUserRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...manageRolesKeys.all, "users-by-role", roleId],
      });
      queryClient.invalidateQueries({
        queryKey: manageRolesKeys.bulkUsers(roleId),
      });
      queryClient.invalidateQueries({
        queryKey: manageRolesKeys.usersWithoutRole(roleId),
      });
      toast.success("Role removed");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to remove role" }),
      );
    },
  });
}

export function useBulkAssignRole(roleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      users,
      extra,
    }: {
      users: string[];
      extra?: BulkAssignExtraPayload;
    }) => bulkAssignRole(roleId, users, extra),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...manageRolesKeys.all, "users-by-role", roleId],
      });
      queryClient.invalidateQueries({
        queryKey: manageRolesKeys.bulkUsers(roleId),
      });
      queryClient.invalidateQueries({
        queryKey: manageRolesKeys.usersWithoutRole(roleId),
      });
      toast.success("Roles bulk-assigned");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to bulk-assign roles" }),
      );
    },
  });
}

export function useBulkRemoveRole(roleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (users: string[]) => bulkRemoveRole(roleId, users),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...manageRolesKeys.all, "users-by-role", roleId],
      });
      queryClient.invalidateQueries({
        queryKey: manageRolesKeys.bulkUsers(roleId),
      });
      queryClient.invalidateQueries({
        queryKey: manageRolesKeys.usersWithoutRole(roleId),
      });
      toast.success("Roles bulk-removed");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to bulk-remove roles" }),
      );
    },
  });
}

// ─── Excel template download ──────────────────────────────────────────────────

export function useBaseTemplateDownload() {
  const [isDownloading, setIsDownloading] = useState(false);

  const download = useCallback(async () => {
    setIsDownloading(true);
    try {
      await downloadBaseTemplate();
    } catch (err) {
      toast.error(
        getApiResponseError(err, { fallback: "Failed to download template" }),
      );
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return { download, isDownloading };
}

// ─── Excel bulk import ────────────────────────────────────────────────────────

export function useBulkExcelImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => bulkAssignFromExcel(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manageRolesKeys.all });
      // Toast will be handled in the component to show detailed results
    },
    onError: () => {
      // Error toast will be handled in the component
    },
  });
}
