/** Friendly names for the engagement rules (keys match the backend). */
export const RULE_NAMES: Record<string, { name: string; about: string }> = {
  MEETING_SOON: {
    name: "Circle meeting soon",
    about: "1–2 hours before a meeting of the person's circle.",
  },
  EVENT_SOON: {
    name: "Event coming up",
    about: "Within a day of an event they marked interested.",
  },
  STREAK_RESCUE: {
    name: "Keep the streak",
    about: "Evening, when a 2+ day karma streak would break today.",
  },
  COMEBACK: {
    name: "Come back",
    about:
      "After 3, 7, 14 and 30 days away, with the new tasks in their groups.",
  },
};
