export const homeKeys = {
  all: ["home"] as const,

  interestGroups: () => [...homeKeys.all, "interest-groups"] as const,
  karmaFeed: () => [...homeKeys.all, "karma-feed"] as const,
  events: () => [...homeKeys.all, "events"] as const,
  calendarEvents: () => [...homeKeys.all, "calendar-events"] as const,
  globalCalendarEvents: () =>
    [...homeKeys.all, "global-calendar-events"] as const,
  companyCalendarEvents: (companyId: string) =>
    [...homeKeys.all, "company-calendar-events", companyId] as const,
  campusCalendarEvents: (campusId: string) =>
    [...homeKeys.all, "campus-calendar-events", campusId] as const,
  igCalendarEvents: (igId: string) =>
    [...homeKeys.all, "ig-calendar-events", igId] as const,
  companySessionCalendar: (companyOrgId: string) =>
    [...homeKeys.all, "company-session-calendar", companyOrgId] as const,
  igMentorSessionCalendar: (igId: string) =>
    [...homeKeys.all, "ig-mentor-session-calendar", igId] as const,
  campusMentorSessionCalendar: (campusId: string) =>
    [...homeKeys.all, "campus-mentor-session-calendar", campusId] as const,
  topPerformers: () => [...homeKeys.all, "top-performers"] as const,

  mentorOverview: () => [...homeKeys.all, "mentor", "overview"] as const,
  mentorSessions: (status?: string) =>
    [...homeKeys.all, "mentor", "sessions", status ?? "SCHEDULED"] as const,
  mentorIgRoles: () => [...homeKeys.all, "mentor", "ig-roles"] as const,
  publicJobsCount: () => [...homeKeys.all, "public-jobs-count"] as const,
  mentorHomeSummary: () => [...homeKeys.all, "mentor", "home-summary"] as const,
  learnerHomeSummary: () =>
    [...homeKeys.all, "learner", "home-summary"] as const,
  learnerStreak: () => [...homeKeys.all, "learner", "streak"] as const,
  companyOrgId: (companyName: string) =>
    [...homeKeys.all, "company", "org-id", companyName] as const,
  companyHomeSummary: (params?: Record<string, any>) =>
    [...homeKeys.all, "company", "home-summary", params ?? {}] as const,
  campusHomeSummary: () => [...homeKeys.all, "campus", "home-summary"] as const,
  campusMemberFunnel: () =>
    [...homeKeys.all, "campus", "member-funnel"] as const,
  campusCircleHealth: () =>
    [...homeKeys.all, "campus", "circle-health"] as const,
  campusRecentActivity: () =>
    [...homeKeys.all, "campus", "recent-activity"] as const,
};
