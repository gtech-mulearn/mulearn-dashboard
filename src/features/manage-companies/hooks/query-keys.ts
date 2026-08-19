export const manageCompaniesKeys = {
  all: ["manage-companies"] as const,
  lists: () => [...manageCompaniesKeys.all, "list"] as const,
  list: (params: {
    page: number;
    per_page: number;
    search: string;
    sort_by: string;
    status: string;
    industry_sector?: string;
  }) => [...manageCompaniesKeys.lists(), params] as const,
  details: () => [...manageCompaniesKeys.all, "detail"] as const,
  detail: (id: string) => [...manageCompaniesKeys.details(), id] as const,
};
