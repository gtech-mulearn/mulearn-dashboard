export const campusManageKeys = {
  all: ["campus-manage"] as const,
  overview: () => [...campusManageKeys.all, "overview"] as const,
  leaderboard: (
    orgId: string,
    page: number,
    search: string,
    ig: string,
    category: string,
    alumni: string,
  ) =>
    [
      ...campusManageKeys.all,
      "leaderboard",
      orgId,
      page,
      search,
      ig,
      category,
      alumni,
    ] as const,
  karmaByCluster: (orgId?: string) =>
    [...campusManageKeys.all, "karma-by-cluster", orgId ?? ""] as const,
  eventDistribution: () =>
    [...campusManageKeys.all, "event-distribution"] as const,
  events: (page: number, status: string, type: string, date: string) =>
    [...campusManageKeys.all, "events", page, status, type, date] as const,
  studentLevels: () => [...campusManageKeys.all, "student-levels"] as const,
  execom: () => [...campusManageKeys.all, "execom"] as const,
  execomRoles: () => [...campusManageKeys.all, "execom-roles"] as const,
  igCodes: () => [...campusManageKeys.all, "ig-codes"] as const,
  globalIgs: () => [...campusManageKeys.all, "global-igs"] as const,
  igChapters: (orgId?: string) =>
    [...campusManageKeys.all, "ig-chapters", orgId ?? ""] as const,
};
