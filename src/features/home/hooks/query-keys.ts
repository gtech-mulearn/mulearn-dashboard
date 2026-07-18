export const homeKeys = {
  all: ["home"] as const,

  interestGroups: () => [...homeKeys.all, "interest-groups"] as const,
  karmaFeed: () => [...homeKeys.all, "karma-feed"] as const,
  events: () => [...homeKeys.all, "events"] as const,
  dashboardCalendarAll: () => [...homeKeys.all, "dashboard-calendar"] as const,
  dashboardCalendar: <T extends object>(params: T) =>
    [...homeKeys.dashboardCalendarAll(), params] as const,
  topPerformers: () => [...homeKeys.all, "top-performers"] as const,

  mentorOverview: () => [...homeKeys.all, "mentor", "overview"] as const,
  mentorSessions: (status?: string) =>
    [...homeKeys.all, "mentor", "sessions", status ?? "SCHEDULED"] as const,
  publicJobsCount: () => [...homeKeys.all, "public-jobs-count"] as const,
  mentorHomeSummary: () => [...homeKeys.all, "mentor", "home-summary"] as const,
  learnerHomeSummary: () =>
    [...homeKeys.all, "learner", "home-summary"] as const,
  learnerStreak: () => [...homeKeys.all, "learner", "streak"] as const,
  companyHomeSummary: (params?: Record<string, unknown>) =>
    [...homeKeys.all, "company", "home-summary", params ?? {}] as const,
  campusHomeSummary: () => [...homeKeys.all, "campus", "home-summary"] as const,
  campusMemberFunnel: () =>
    [...homeKeys.all, "campus", "member-funnel"] as const,
  campusCircleHealth: () =>
    [...homeKeys.all, "campus", "circle-health"] as const,
  campusRecentActivity: () =>
    [...homeKeys.all, "campus", "recent-activity"] as const,
};
