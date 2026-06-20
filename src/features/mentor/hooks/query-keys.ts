export const mentorKeys = {
  all: ["mentor"] as const,
  overview: () => [...mentorKeys.all, "overview"] as const,
  availability: () => [...mentorKeys.all, "availability"] as const,
  // Public mentor endpoints (auth required, by mentor UUID)
  public: {
    profile: (mentorId: string) =>
      [...mentorKeys.all, "public", "profile", mentorId] as const,
    availability: (mentorId: string) =>
      [...mentorKeys.all, "public", "availability", mentorId] as const,
  },
  sessions: {
    all: ["mentor-sessions"] as const,
    // #12 Mentor's own sessions
    list: (params: Record<string, unknown>) =>
      [...mentorKeys.sessions.all, "list", params] as const,
    // #13 Single session detail
    detail: (id: string) => [...mentorKeys.sessions.all, "detail", id] as const,
    // #15 Available sessions (learner discovery)
    available: (params: Record<string, unknown>) =>
      [...mentorKeys.sessions.all, "available", params] as const,
    // #16 Admin session list
    adminList: (params: Record<string, unknown>) =>
      [...mentorKeys.sessions.all, "admin-list", params] as const,
    // #20 Participants for a session
    participants: (id: string) =>
      [...mentorKeys.sessions.all, "participants", id] as const,
    // #19 Learner participation history
    participantHistory: (params: Record<string, unknown>) =>
      [...mentorKeys.sessions.all, "participant-history", params] as const,
  },
};
