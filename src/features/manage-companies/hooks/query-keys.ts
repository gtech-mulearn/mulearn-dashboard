export const manageCompaniesKeys = {
  all: ["manage-companies"] as const,
  lists: () => [...manageCompaniesKeys.all, "list"] as const,
  list: (params: {
    pageIndex: number;
    perPage: number;
    search: string;
    sortBy: string;
    status: string;
  }) => [...manageCompaniesKeys.lists(), params] as const,
  details: () => [...manageCompaniesKeys.all, "detail"] as const,
  detail: (id: string) => [...manageCompaniesKeys.details(), id] as const,
};
