export const organizationsKeys = {
  all: ["organizations"] as const,
  lists: () => [...organizationsKeys.all, "list"] as const,
  list: (params: {
    perPage: number;
    pageIndex: number;
    search: string;
    sortBy: string;
    org_type: string;
  }) => [...organizationsKeys.lists(), params] as const,
  details: () => [...organizationsKeys.all, "detail"] as const,
  detail: (id: string) => [...organizationsKeys.details(), id] as const,
  affiliations: () => [...organizationsKeys.all, "affiliations"] as const,
  countries: () => [...organizationsKeys.all, "countries"] as const,
  states: (countryId: string) =>
    [...organizationsKeys.all, "states", countryId] as const,
  districts: (stateId: string) =>
    [...organizationsKeys.all, "districts", stateId] as const,
};
