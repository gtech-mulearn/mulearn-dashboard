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

  // Circle queries
  circleList: () => [...learningCircleKeys.circles(), "list"] as const,
  circleDetail: (id: string) =>
    [...learningCircleKeys.circles(), "detail", id] as const,
  circleMembers: (id: string) =>
    [...learningCircleKeys.circles(), "members", id] as const,

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
