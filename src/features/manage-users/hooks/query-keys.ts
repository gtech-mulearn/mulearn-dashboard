// src/features/manage-users/hooks/query-keys.ts

export const manageUsersKeys = {
  all: ["manage-users"] as const,

  list: (params?: {
    perPage?: number;
    pageIndex?: number;
    search?: string;
    sortBy?: string;
  }) => [...manageUsersKeys.all, "list", params ?? {}] as const,

  detail: (id: string) => [...manageUsersKeys.all, "detail", id] as const,
  csv: () => [...manageUsersKeys.all, "csv"] as const,

  communities: () => [...manageUsersKeys.all, "communities"] as const,
  roles: () => [...manageUsersKeys.all, "roles"] as const,
  areasOfInterest: () => [...manageUsersKeys.all, "areas-of-interest"] as const,

  collegesByDistrict: (district: string) =>
    [...manageUsersKeys.all, "colleges-by-district", district] as const,

  schoolsByDistrict: (district: string) =>
    [...manageUsersKeys.all, "schools-by-district", district] as const,

  locationSearch: (param: string) =>
    [...manageUsersKeys.all, "location-search", param] as const,
};
