"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  createCommunityPartner,
  deleteCommunityPartner,
  fetchCommunityPartners,
  updateCommunityPartner,
} from "../api/community-partner.api";
import type {
  CommunityPartner,
  CommunityPartnerWrite,
} from "../schemas/community-partner.schema";

export function useCommunityPartners(igId: string) {
  const queryClient = useQueryClient();
  const qKey = ["community-partners", igId];

  const { data, isLoading } = useQuery({
    queryKey: qKey,
    queryFn: () => fetchCommunityPartners({ ig_id: igId }),
  });
  const partners: CommunityPartner[] = data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (data: CommunityPartnerWrite) =>
      createCommunityPartner({ ...data, interest_groups: [igId] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qKey });
      toast.success("Community partner created");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to create community partner",
        }),
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CommunityPartnerWrite>;
    }) => updateCommunityPartner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qKey });
      toast.success("Community partner updated");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update community partner",
        }),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCommunityPartner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qKey });
      toast.success("Community partner removed");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to remove community partner",
        }),
      );
    },
  });

  return {
    partners,
    isLoading,
    createPartner: createMutation.mutateAsync,
    updatePartner: updateMutation.mutateAsync,
    deletePartner: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
