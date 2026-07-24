"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  createImpactProject,
  deleteImpactProject,
  updateImpactProject,
  uploadImpactProjectImage,
} from "../api/impact-projects.api";
import type { ImpactProjectCreate, ImpactProjectUpdate } from "../schemas";
import { impactProjectsKeys } from "./impact-projects-query-keys";

export function useImpactProjectMutations(igId: string) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: impactProjectsKeys.byIg(igId) });

  const createMutation = useMutation({
    mutationFn: (data: ImpactProjectCreate) => createImpactProject(igId, data),
    onSuccess: () => {
      toast.success("Impact project created successfully");
      invalidate();
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to create impact project",
        }),
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: ImpactProjectUpdate;
    }) => updateImpactProject(igId, projectId, data),
    onSuccess: () => {
      toast.success("Impact project updated successfully");
      invalidate();
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update impact project",
        }),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => deleteImpactProject(igId, projectId),
    onSuccess: () => {
      toast.success("Impact project deleted successfully");
      invalidate();
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to delete impact project",
        }),
      );
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: ({ projectId, file }: { projectId: string; file: File }) =>
      uploadImpactProjectImage(igId, projectId, file),
    onSuccess: () => {
      invalidate();
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to upload image" }),
      );
    },
  });

  return {
    createImpactProject: createMutation.mutateAsync,
    updateImpactProject: (projectId: string, data: ImpactProjectUpdate) =>
      updateMutation.mutateAsync({ projectId, data }),
    deleteImpactProject: deleteMutation.mutateAsync,
    uploadImpactProjectImage: (projectId: string, file: File) =>
      uploadImageMutation.mutateAsync({ projectId, file }),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUploadingImage: uploadImageMutation.isPending,
  };
}
