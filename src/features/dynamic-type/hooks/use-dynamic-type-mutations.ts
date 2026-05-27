/**
 * Dynamic Type Mutation Hooks
 *
 * 📍 src/features/dynamic-type/hooks/use-dynamic-type-mutations.ts
 *
 * All create / update / delete mutations for both Role and User tabs.
 * - Create/Update mutations: invalidate the relevant list.
 * - Delete mutations: optimistic removal from cache.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/api";
import {
  createDynamicRole,
  createDynamicUser,
  deleteDynamicRole,
  deleteDynamicUser,
  updateDynamicRole,
  updateDynamicUser,
} from "../api";
import type { DynamicRoleItem, DynamicUserItem } from "../types";
import { dynamicTypeKeys } from "./query-keys";

// ============================================
// Dynamic Role Mutations
// ============================================

export function useCreateDynamicRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { type: string; role: string }) =>
      createDynamicRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dynamicTypeKeys.roles() });
      toast.success("Role mapping created successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to create role mapping",
      );
    },
  });
}

export function useUpdateDynamicRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, new_role }: { id: string; new_role: string }) =>
      updateDynamicRole(id, { new_role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dynamicTypeKeys.roles() });
      toast.success("Role mapping updated successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to update role mapping",
      );
    },
  });
}

export function useDeleteDynamicRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDynamicRole(id),
    // Optimistic removal
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: dynamicTypeKeys.roles() });
      const previous = queryClient.getQueryData<DynamicRoleItem[]>(
        dynamicTypeKeys.roles(),
      );
      queryClient.setQueryData<DynamicRoleItem[]>(
        dynamicTypeKeys.roles(),
        (old: DynamicRoleItem[] | undefined) =>
          old?.filter((item: DynamicRoleItem) => item.id !== id) ?? [],
      );
      return { previous };
    },
    onError: (
      error: unknown,
      _id: string,
      context: { previous: DynamicRoleItem[] | undefined } | undefined,
    ) => {
      if (context?.previous) {
        queryClient.setQueryData(dynamicTypeKeys.roles(), context.previous);
      }
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to delete role mapping",
      );
    },
    onSuccess: () => {
      toast.success("Role mapping deleted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: dynamicTypeKeys.roles() });
    },
  });
}

// ============================================
// Dynamic User Mutations
// ============================================

export function useCreateDynamicUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { type: string; user: string }) =>
      createDynamicUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dynamicTypeKeys.users() });
      toast.success("User mapping created successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to create user mapping",
      );
    },
  });
}

export function useUpdateDynamicUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, new_user }: { id: string; new_user: string }) =>
      updateDynamicUser(id, { new_user }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dynamicTypeKeys.users() });
      toast.success("User mapping updated successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to update user mapping",
      );
    },
  });
}

export function useDeleteDynamicUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDynamicUser(id),
    // Optimistic removal
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: dynamicTypeKeys.users() });
      const previous = queryClient.getQueryData<DynamicUserItem[]>(
        dynamicTypeKeys.users(),
      );
      queryClient.setQueryData<DynamicUserItem[]>(
        dynamicTypeKeys.users(),
        (old: DynamicUserItem[] | undefined) =>
          old?.filter((item: DynamicUserItem) => item.id !== id) ?? [],
      );
      return { previous };
    },
    onError: (
      error: unknown,
      _id: string,
      context: { previous: DynamicUserItem[] | undefined } | undefined,
    ) => {
      if (context?.previous) {
        queryClient.setQueryData(dynamicTypeKeys.users(), context.previous);
      }
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to delete user mapping",
      );
    },
    onSuccess: () => {
      toast.success("User mapping deleted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: dynamicTypeKeys.users() });
    },
  });
}
