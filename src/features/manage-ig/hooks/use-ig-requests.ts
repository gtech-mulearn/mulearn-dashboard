"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  submitIgRequest as apiSubmitRequest,
  getIgRequests,
  updateIgRequestStatus,
} from "../api/manage-ig.api";

export function useIGRequests() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [sortBy, setSortBy] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "ig-requests",
      { pageIndex: page, perPage, search, status, sortBy },
    ],
    queryFn: () =>
      getIgRequests({
        pageIndex: page,
        perPage,
        search,
        status,
        sortBy,
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      newStatus,
    }: {
      id: string;
      newStatus: "active" | "requested" | "cancelled" | "rejected";
    }) => updateIgRequestStatus(id, newStatus),
    onSuccess: (_data, variables) => {
      toast.success(`Request marked as ${variables.newStatus}`);
      queryClient.invalidateQueries({ queryKey: ["ig-requests"] });
    },
    onError: () => {
      toast.error("Failed to update request status");
    },
  });

  const submitRequestMutation = useMutation({
    mutationFn: apiSubmitRequest,
    onSuccess: () => {
      toast.success("IG request submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["ig-requests"] });
    },
    onError: () => {
      toast.error("Failed to submit IG request");
    },
  });

  return {
    requests: data?.data || [],
    isLoading,
    page,
    perPage,
    totalCount: data?.pagination?.count || 0,
    search,
    status,
    sortBy,
    setPage,
    setPerPage,
    setSearch,
    setStatus,
    setSortBy,
    updateStatus: (
      id: string,
      newStatus: "active" | "requested" | "cancelled" | "rejected",
    ) => updateStatusMutation.mutateAsync({ id, newStatus }),
    submitRequest: submitRequestMutation.mutateAsync,
    isSubmitting: submitRequestMutation.isPending,
    refresh: refetch,
  };
}
