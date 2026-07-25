"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { igKeys } from "@/features/interest-groups";
import {
  partialUpdateInterestGroup,
  removeIgCoverImage,
  removeIgIconImage,
  uploadIgCoverImage,
  uploadIgIconImage,
} from "@/features/manage-ig/api/manage-ig.api";
import type { InterestGroupUpdate } from "@/features/manage-ig/schemas";
import { getApiResponseError } from "@/hooks/use-get-error";

export function useEditInterestGroup() {
  const queryClient = useQueryClient();

  // igKeys.detail(id) is nested under igKeys.all, so invalidating igKeys.all
  // already covers both the detail query and the list query — no need to
  // invalidate detail(id) separately, and no need to await either (React
  // Query refetches invalidated active queries in the background).
  const invalidateIg = () => {
    queryClient.invalidateQueries({ queryKey: igKeys.all });
    // Admin table reads its own query, keyed independently of igKeys.
    queryClient.invalidateQueries({ queryKey: ["admin-interest-groups"] });
  };

  const mutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<InterestGroupUpdate>;
    }) => partialUpdateInterestGroup(id, data),
    onSuccess: () => {
      toast.success("Interest group updated successfully");
      invalidateIg();
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update interest group",
        }),
      );
    },
  });

  const uploadCoverImageMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      uploadIgCoverImage(id, file),
    onSuccess: () => {
      toast.success("Cover image updated");
      invalidateIg();
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to upload cover image",
        }),
      );
    },
  });

  const removeCoverImageMutation = useMutation({
    mutationFn: (id: string) => removeIgCoverImage(id),
    onSuccess: () => {
      toast.success("Cover image removed");
      invalidateIg();
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to remove cover image",
        }),
      );
    },
  });

  const uploadIconImageMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      uploadIgIconImage(id, file),
    onSuccess: () => {
      toast.success("Icon image updated");
      invalidateIg();
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to upload icon image" }),
      );
    },
  });

  const removeIconImageMutation = useMutation({
    mutationFn: (id: string) => removeIgIconImage(id),
    onSuccess: () => {
      toast.success("Icon image removed");
      invalidateIg();
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to remove icon image" }),
      );
    },
  });

  return {
    editInterestGroup: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    uploadCoverImage: (id: string, file: File) =>
      uploadCoverImageMutation.mutateAsync({ id, file }),
    removeCoverImage: (id: string) => removeCoverImageMutation.mutateAsync(id),
    uploadIconImage: (id: string, file: File) =>
      uploadIconImageMutation.mutateAsync({ id, file }),
    removeIconImage: (id: string) => removeIconImageMutation.mutateAsync(id),
    isUploadingCoverImage: uploadCoverImageMutation.isPending,
    isRemovingCoverImage: removeCoverImageMutation.isPending,
    isUploadingIconImage: uploadIconImageMutation.isPending,
    isRemovingIconImage: removeIconImageMutation.isPending,
  };
}
