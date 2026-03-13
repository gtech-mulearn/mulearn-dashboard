export const manageRolesKeys = {
  all: ["manage-roles"] as const,
  lists: () => [...manageRolesKeys.all, "list"] as const,
  list: (params: {
    pageIndex: number;
    perPage: number;
    search: string;
    sortBy: string;
  }) =>
    [
      ...manageRolesKeys.lists(),
      params.pageIndex,
      params.perPage,
      params.search,
      params.sortBy,
    ] as const,
  usersByRole: (roleId: string, search: string) =>
    [...manageRolesKeys.all, "users-by-role", roleId, search] as const,
  bulkUsers: (roleId: string) =>
    [...manageRolesKeys.all, "bulk-users", roleId] as const,
  usersWithoutRole: (roleId: string) =>
    [...manageRolesKeys.all, "users-without-role", roleId] as const,
};
