export const homeKeys = {
  all: ["home"] as const,

  interestGroups: () => [...homeKeys.all, "interest-groups"] as const,
  karmaFeed: () => [...homeKeys.all, "karma-feed"] as const,
  events: () => [...homeKeys.all, "events"] as const,
  calendarEvents: () => [...homeKeys.all, "calendar-events"] as const,
};
