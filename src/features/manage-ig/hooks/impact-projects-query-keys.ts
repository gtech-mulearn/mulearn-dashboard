export const impactProjectsKeys = {
  all: ["impact-projects"] as const,
  byIg: (igId: string) => [...impactProjectsKeys.all, igId] as const,
};
