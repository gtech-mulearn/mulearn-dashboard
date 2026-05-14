export const homeKeys = {
  all: ["home"] as const,

  interestGroups: () => [...homeKeys.all, "interest-groups"] as const,
  karmaFeed: () => [...homeKeys.all, "karma-feed"] as const,
  events: () => [...homeKeys.all, "events"] as const,
  calendarEvents: () => [...homeKeys.all, "calendar-events"] as const,
  topPerformers: () => [...homeKeys.all, "top-performers"] as const,

  mentorOverview: () => [...homeKeys.all, "mentor", "overview"] as const,
  mentorSessions: (status?: string) =>
    [...homeKeys.all, "mentor", "sessions", status ?? "SCHEDULED"] as const,
  mentorMentees: () => [...homeKeys.all, "mentor", "mentees"] as const,
  mentorIgRoles: () => [...homeKeys.all, "mentor", "ig-roles"] as const,
  publicJobsCount: () => [...homeKeys.all, "public-jobs-count"] as const,
};
