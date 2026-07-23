"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { igKeys } from "@/features/interest-groups";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  createInterestGroup as apiCreateIG,
  deleteInterestGroup as apiDeleteIG,
  exportIgCSV as apiExportCSV,
  partialUpdateInterestGroup as apiPartialUpdateIG,
  updateInterestGroup as apiUpdateIG,
  getAdminInterestGroups,
} from "../api/manage-ig.api";
import type { InterestGroupUpdate } from "../schemas";

export function useInterestGroupsAdmin() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-interest-groups", { page, perPage, search, sortBy }],
    queryFn: () =>
      getAdminInterestGroups({
        pageIndex: page,
        perPage,
        search,
        sortBy,
      }),
  });

  const createMutation = useMutation({
    mutationFn: apiCreateIG,
    onSuccess: () => {
      toast.success("Interest Group created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-interest-groups"] });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to create interest group",
        }),
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InterestGroupUpdate }) =>
      apiUpdateIG(id, data),
    onSuccess: (_, variables) => {
      toast.success("Interest Group updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-interest-groups"] });
      queryClient.invalidateQueries({ queryKey: igKeys.detail(variables.id) });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update interest group",
        }),
      );
    },
  });

  const partialUpdateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<InterestGroupUpdate>;
    }) => apiPartialUpdateIG(id, data),
    onSuccess: (_, variables) => {
      toast.success("Interest Group partially updated");
      queryClient.invalidateQueries({ queryKey: ["admin-interest-groups"] });
      queryClient.invalidateQueries({ queryKey: igKeys.detail(variables.id) });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update interest group",
        }),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDeleteIG(id),
    onSuccess: () => {
      toast.success("Interest Group deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-interest-groups"] });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to delete interest group",
        }),
      );
    },
  });

  const exportCSV = async () => {
    try {
      const blob = await apiExportCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `interest_groups_${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("CSV exported successfully");
    } catch (error) {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to export CSV" }),
      );
    }
  };

  return {
    interestGroups: data?.data || [],
    isLoading,
    page,
    perPage,
    search,
    sortBy,
    totalCount: data?.pagination.count || 0,
    totalPages: data?.pagination.totalPages || 0,
    setPage,
    setPerPage,
    setSearch,
    setSortBy,
    createInterestGroup: createMutation.mutateAsync,
    updateInterestGroup: (id: string, data: InterestGroupUpdate) =>
      updateMutation.mutateAsync({ id, data }),
    partialUpdateInterestGroup: (
      id: string,
      data: Partial<InterestGroupUpdate>,
    ) => partialUpdateMutation.mutateAsync({ id, data }),
    deleteInterestGroup: deleteMutation.mutateAsync,
    exportCSV,
    refresh: refetch,
  };
}
