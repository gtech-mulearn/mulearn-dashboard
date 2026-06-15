export const organizationsKeys = {
  all: ["organizations"] as const,
  lists: () => [...organizationsKeys.all, "list"] as const,
  list: (params: object) => [...organizationsKeys.lists(), params] as const,
  affiliations: () => ["organizations", "affiliations"] as const,
  countries: () => ["organizations", "countries"] as const,
  states: () => ["organizations", "states"] as const,
  districts: (stateId?: string) =>
    ["organizations", "districts", stateId] as const,
};

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
