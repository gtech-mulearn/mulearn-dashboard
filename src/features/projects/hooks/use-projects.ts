import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getProject,
  listMembers,
  listProjects,
  listProjectsForMuid,
} from "../api";
import type { ProjectStatus } from "../schemas";
import { projectsKeys } from "./query-keys";

const STALE = 60 * 1000;

export function useProjectsByMuid(muid: string, status?: ProjectStatus) {
  return useQuery({
    queryKey: projectsKeys.byMuid(muid, status),
    queryFn: () => listProjectsForMuid(muid, { status }),
    enabled: !!muid,
    staleTime: STALE,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectsKeys.detail(id),
    queryFn: () => getProject(id),
    enabled: !!id,
    staleTime: STALE,
  });
}

export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: projectsKeys.members(projectId),
    queryFn: () => listMembers(projectId),
    enabled: !!projectId,
    staleTime: STALE,
  });
}

export function usePublicProjects(search: string, page: number) {
  return useQuery({
    queryKey: projectsKeys.public(search, page),
    queryFn: () =>
      listProjects({ search: search || undefined, page, perPage: 12 }),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}
