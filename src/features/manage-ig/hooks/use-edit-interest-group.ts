"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { igKeys } from "@/features/interest-groups";
import { partialUpdateInterestGroup } from "@/features/manage-ig/api/manage-ig.api";
import type { InterestGroupUpdate } from "@/features/manage-ig/schemas";

export function useEditInterestGroup() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<InterestGroupUpdate>;
    }) => partialUpdateInterestGroup(id, data),
    onSuccess: (_, variables) => {
      toast.success("Interest group updated successfully");
      queryClient.invalidateQueries({
        queryKey: igKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: igKeys.all,
      });
    },
  });

  return {
    editInterestGroup: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
}
