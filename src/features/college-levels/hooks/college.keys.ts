export const collegeLevelsKeys = {
  all: ["college-levels"] as const,

  lists: () => [...collegeLevelsKeys.all, "list"] as const,

  list: (params: {
    pageIndex: number;
    perPage: number;
    search?: string;
    sortBy?: string;
  }) =>
    [
      ...collegeLevelsKeys.lists(),
      params.pageIndex,
      params.perPage,
      params.search ?? "",
      params.sortBy ?? "",
    ] as const,
};
