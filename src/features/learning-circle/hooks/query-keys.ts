/**
 * Learning Circle Query Keys
 *
 * 📍 src/features/learning-circle/hooks/query-keys.ts
 *
 * Centralized query keys for React Query caching.
 */

export const learningCircleKeys = {
  // Base keys
  all: ["learning-circles"] as const,
  circles: () => [...learningCircleKeys.all, "circles"] as const,
  meetings: () => [...learningCircleKeys.all, "meetings"] as const,
  invites: () => [...learningCircleKeys.all, "invites"] as const,
  colleges: (params?: Record<string, unknown>) =>
    [...learningCircleKeys.all, "colleges", params] as const,

  // Circle queries
  circleList: (params?: Record<string, unknown>) =>
    [...learningCircleKeys.circles(), "list", params] as const,
  userCircles: () => [...learningCircleKeys.circles(), "user-circles"] as const,
  circleDetail: (id: string) =>
    [...learningCircleKeys.circles(), "detail", id] as const,
  circleMembers: (id: string) =>
    [...learningCircleKeys.circles(), "members", id] as const,
  joinRequests: (id: string) =>
    [...learningCircleKeys.circles(), "joinRequests", id] as const,

  // Invite queries
  sentInvites: (circleId: string) =>
    [...learningCircleKeys.invites(), "sent", circleId] as const,
  myPendingInvites: () => [...learningCircleKeys.invites(), "pending"] as const,
  inviteByLink: (linkId: string) =>
    [...learningCircleKeys.invites(), "byLink", linkId] as const,

  // Meeting queries
  meetingsByCircle: (circleId: string) =>
    [...learningCircleKeys.meetings(), "byCircle", circleId] as const,
  meetingsPublic: (filters?: Record<string, unknown>) =>
    [...learningCircleKeys.meetings(), "public", filters] as const,
  meetingsUser: (filters?: Record<string, unknown>) =>
    [...learningCircleKeys.meetings(), "user", filters] as const,
  meetingDetail: (id: string) =>
    [...learningCircleKeys.meetings(), "detail", id] as const,
  attendeeReport: (id: string) =>
    [...learningCircleKeys.meetings(), "attendeeReport", id] as const,
  meetingReport: (id: string) =>
    [...learningCircleKeys.meetings(), "meetingReport", id] as const,
} as const;
