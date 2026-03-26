import { useQuery } from "@tanstack/react-query";
import { fetchColleges } from "../api/college.api";
import { collegeLevelsKeys } from "./college.keys";

interface UseCollegeLevelsParams {
  pageIndex: number;
  perPage: number;
  search?: string;
  sortBy?: string;
}

export function useCollegeLevelsList(
  params: UseCollegeLevelsParams,
  enabled = true,
) {
  return useQuery({
    queryKey: collegeLevelsKeys.list({
      pageIndex: params.pageIndex,
      perPage: params.perPage,
      search: params.search ?? "",
      sortBy: params.sortBy ?? "",
    }),
    queryFn: () => fetchColleges(params),
    enabled,
  });
}
