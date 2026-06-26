import type { TInternQueryParams } from "../api";

export const internKeys = {
  all: ["intern"] as const,

  // Intern Dashboard
  overviewStatus: () => [...internKeys.all, "overview", "status"] as const,
  overviewActivity: (params: TInternQueryParams) =>
    [...internKeys.all, "overview", "activity", params] as const,
  topLeaderboard: () =>
    [...internKeys.all, "overview", "leaderboard", "top"] as const,
  timesheets: () => [...internKeys.all, "timesheets"] as const,
  timesheetHistory: (params: TInternQueryParams) =>
    [...internKeys.timesheets(), "history", params] as const,
  timesheetToday: () => [...internKeys.timesheets(), "today"] as const,
  timesheetSummary: () => [...internKeys.timesheets(), "summary"] as const,
  reviews: () => [...internKeys.all, "reviews"] as const,
  reviewHistory: (params: TInternQueryParams) =>
    [...internKeys.reviews(), "history", params] as const,
  reviewCurrent: () => [...internKeys.reviews(), "current"] as const,
  tasks: () => [...internKeys.all, "tasks"] as const,
  tasksMine: (params: TInternQueryParams) =>
    [...internKeys.tasks(), "mine", params] as const,
  leaves: () => [...internKeys.all, "leaves"] as const,
  leaveHistory: (params: TInternQueryParams) =>
    [...internKeys.leaves(), "history", params] as const,
  leaveBalance: () => [...internKeys.leaves(), "balance"] as const,
  leaderboard: () => [...internKeys.all, "leaderboard"] as const,
  leaderboardFull: (params: TInternQueryParams) =>
    [...internKeys.leaderboard(), "full", params] as const,
  leaderboardMe: () => [...internKeys.leaderboard(), "me"] as const,
  guilds: () => [...internKeys.all, "guilds"] as const,
  myMinutes: (params: TInternQueryParams) =>
    [...internKeys.all, "minutes", "mine", params] as const,

  // Admin Manage Dashboard
  manage: () => [...internKeys.all, "manage"] as const,
  manageInterns: (params: TInternQueryParams) =>
    [...internKeys.manage(), "interns", params] as const,
  manageStatus: () => [...internKeys.manage(), "status"] as const,
  manageTasks: (params: TInternQueryParams) =>
    [...internKeys.manage(), "tasks", params] as const,
  manageLeaves: (params: TInternQueryParams) =>
    [...internKeys.manage(), "leaves", params] as const,
  manageLeaveDetail: (id: string) =>
    [...internKeys.manage(), "leaves", "detail", id] as const,
  manageTimesheets: (params: TInternQueryParams) =>
    [...internKeys.manage(), "timesheets", params] as const,
  manageReviews: (params: TInternQueryParams) =>
    [...internKeys.manage(), "reviews", params] as const,
  manageMinutes: (params: TInternQueryParams) =>
    [...internKeys.manage(), "minutes", params] as const,
  manageTaskDetail: (id: string) =>
    [...internKeys.manage(), "tasks", "detail", id] as const,
};
