export const mentorKeys = {
  all: ["mentor"] as const,
  availability: () => [...mentorKeys.all, "availability"] as const,
  availabilityCalendar: () =>
    [...mentorKeys.all, "availability-calendar"] as const,
  public: {
    card: (muid: string) =>
      [...mentorKeys.all, "public", "card", muid] as const,
    sessions: (muid: string, params: Record<string, unknown>) =>
      [...mentorKeys.all, "public", "sessions", muid, params] as const,
    availability: (muid: string, igId?: string) =>
      [...mentorKeys.all, "public", "availability", muid, igId ?? ""] as const,
  },
  sessions: {
    all: ["mentor-sessions"] as const,
    list: (params: Record<string, unknown>) =>
      [...mentorKeys.sessions.all, "list", params] as const,
    pending: () => [...mentorKeys.sessions.all, "pending"] as const,
    detail: (id: string) => [...mentorKeys.sessions.all, "detail", id] as const,
    participants: (id: string) =>
      [...mentorKeys.sessions.all, "participants", id] as const,
  },
};
