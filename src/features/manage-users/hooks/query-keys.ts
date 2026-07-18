export const manageUsersKeys = {
  all: ["manage-users"] as const,
  lists: () => [...manageUsersKeys.all, "list"] as const,
  list: (params: {
    pageIndex: number;
    perPage: number;
    search: string;
    sortBy: string;
  }) =>
    [
      ...manageUsersKeys.lists(),
      params.pageIndex,
      params.perPage,
      params.search,
      params.sortBy,
    ] as const,
  detail: (id: string) => [...manageUsersKeys.all, "detail", id] as const,
  meta: () => [...manageUsersKeys.all, "meta"] as const,
  locations: (query: string) =>
    [...manageUsersKeys.all, "locations", query] as const,
  states: (countryId: string) =>
    [...manageUsersKeys.all, "states", countryId] as const,
  districts: (stateId: string) =>
    [...manageUsersKeys.all, "districts", stateId] as const,
  collegeData: (districtId: string) =>
    [...manageUsersKeys.all, "college-data", districtId] as const,
  resolveLocation: (queryText?: string) =>
    [...manageUsersKeys.all, "resolve-location", queryText] as const,
};
