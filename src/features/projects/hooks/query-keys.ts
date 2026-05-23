import type { ProjectStatus } from "../schemas";

export const projectsKeys = {
  all: ["projects"] as const,
  byMuid: (muid: string, status?: ProjectStatus) =>
    [...projectsKeys.all, "by-muid", muid, status ?? "default"] as const,
  detail: (id: string) => [...projectsKeys.all, "detail", id] as const,
  members: (projectId: string) =>
    [...projectsKeys.all, "members", projectId] as const,
};
