export const mentorKeys = {
  all: ["mentor"] as const,
  availability: () => [...mentorKeys.all, "availability"] as const,
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
