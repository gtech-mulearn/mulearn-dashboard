import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { listIGRequests } from "../api";
import { igRequestKeys } from "./query-keys";

export function useIGRequestsList(
  params: {
    page?: number;
    perPage?: number;
    search?: string;
    status?: string;
    sortBy?: string;
  } = {},
) {
  return useQuery({
    queryKey: igRequestKeys.list(params),
    queryFn: () => listIGRequests(params),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
