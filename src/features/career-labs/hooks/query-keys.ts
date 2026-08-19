import type { HiringStatusFilter } from "../schemas";

export const careerLabsKeys = {
  all: ["career-labs-hiring"] as const,
  lists: () => [...careerLabsKeys.all, "list"] as const,
  list: (params: {
    pageIndex: number;
    perPage: number;
    search: string;
    sortBy: string;
    status: HiringStatusFilter;
  }) =>
    [
      ...careerLabsKeys.lists(),
      params.pageIndex,
      params.perPage,
      params.search,
      params.sortBy,
      params.status,
    ] as const,
};
