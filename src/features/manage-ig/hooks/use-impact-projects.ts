"use client";

import { useQuery } from "@tanstack/react-query";
import { getImpactProjects } from "../api/impact-projects.api";
import { impactProjectsKeys } from "./impact-projects-query-keys";

export function useImpactProjects(igId: string) {
  return useQuery({
    queryKey: impactProjectsKeys.byIg(igId),
    queryFn: () => getImpactProjects(igId),
    enabled: !!igId,
  });
}
