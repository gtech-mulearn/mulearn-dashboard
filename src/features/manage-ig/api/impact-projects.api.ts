import { ApiError, apiClient, authedFetch } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { getApiResponseError } from "@/hooks/use-get-error";
import type {
  ImpactProject,
  ImpactProjectCreate,
  ImpactProjectUpdate,
} from "../schemas";
import {
  ImpactProjectImageResponseSchema,
  ImpactProjectResponseSchema,
  ImpactProjectsListResponseSchema,
} from "../schemas";

export async function getImpactProjects(
  igId: string,
): Promise<ImpactProject[]> {
  const response = await apiClient.get(
    endpoints.impactProjects.list(igId),
    ImpactProjectsListResponseSchema,
  );
  return response.response.data;
}

export async function createImpactProject(
  igId: string,
  data: ImpactProjectCreate,
): Promise<ImpactProject> {
  const response = await apiClient.post(
    endpoints.impactProjects.list(igId),
    data,
    ImpactProjectResponseSchema,
  );
  return response.response.impactProject;
}

export async function updateImpactProject(
  igId: string,
  projectId: string,
  data: ImpactProjectUpdate,
): Promise<ImpactProject> {
  const response = await apiClient.patch(
    endpoints.impactProjects.detail(igId, projectId),
    data,
    ImpactProjectResponseSchema,
  );
  return response.response.impactProject;
}

export async function deleteImpactProject(
  igId: string,
  projectId: string,
): Promise<void> {
  return apiClient.delete(endpoints.impactProjects.detail(igId, projectId));
}

export async function uploadImpactProjectImage(
  igId: string,
  projectId: string,
  file: File,
): Promise<string> {
  const fd = new FormData();
  fd.append("image", file);

  const res = await authedFetch(
    endpoints.impactProjects.image(igId, projectId),
    {
      method: "POST",
      body: fd,
    },
  );
  const raw = await res.json();
  if (!res.ok) {
    const msg = getApiResponseError(raw, {
      fallback: "Failed to upload image. Please try again.",
    });
    throw new ApiError(res.status, msg, raw);
  }
  return ImpactProjectImageResponseSchema.parse(raw).response.image;
}
