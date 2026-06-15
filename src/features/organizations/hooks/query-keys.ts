export * from "./org-error";
export * from "./use-departments";
export * from "./use-organizations";
export * from "./use-transfer";
export * from "./use-verification";

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
