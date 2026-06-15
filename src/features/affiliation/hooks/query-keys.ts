export const affiliationKeys = {
  all: ["affiliation"] as const,
  lists: () => [...affiliationKeys.all, "list"] as const,
  list: (params: {
    pageIndex: number;
    perPage: number;
    search: string;
    sortBy: string;
  }) =>
    [
      ...affiliationKeys.lists(),
      params.pageIndex,
      params.perPage,
      params.search,
      params.sortBy,
    ] as const,
};
