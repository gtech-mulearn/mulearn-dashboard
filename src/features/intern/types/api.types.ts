export interface TPagination {
  count: number;
  totalPages: number;
  isNext: boolean;
  isPrev: boolean;
  nextPage: number | null;
}

export interface TPaginatedData<T> {
  data: T[];
  pagination: TPagination;
}

export interface TInternOverviewStatus {
  guild: string;
  status: string;
  role?: "INTERN" | "INTERN_LEAD" | "Intern" | "Intern Lead";
  total_intern_karma: number;
  completed_tasks: number;
  complexity_score: number;
  join_date?: string;
}

export interface TInternActivityLog {
  id: string;
  task_title: string;
  karma: number;
  created_at: string;
}

export interface TLeaderboardRow {
  user_id: string;
  muid?: string;
  full_name: string;
  guild: string;
  score: number;
  rank: number;
  status?: string;
  profile_pic?: string | null;
  daily_streak?: number;
}

export type TInternTaskStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "WAITING_FOR_REVIEW"
  | "ON_HOLD"
  | "OVERDUE";

/**
 * `SUBMITTED` is the only status for new timesheets (no approval).
 * `APPROVED` / `PENDING` / `REJECTED` exist only on legacy rows.
 */
export type TTimesheetStatus =
  | "SUBMITTED"
  | "APPROVED"
  | "PENDING"
  | "REJECTED";

/** Snapshot of a task update stored on a timesheet. */
export interface TTimesheetTaskEntry {
  task_id: string;
  title: string;
  status: TInternTaskStatus;
  remark: string | null;
}

export interface TTimesheet {
  id: string;
  entry_date: string;
  task: TTimesheetTaskEntry[] | null;
  description: string;
  hours: string;
  blockers: string | null;
  end_of_day_note: string | null;
  edit_reason: string | null;
  status: TTimesheetStatus;
  review_note: string | null;
  created_at: string;
  user_id?: string; // admin view
  user_name?: string; // admin view
  muid?: string; // admin view
}

export interface TTimesheetTaskInput {
  task_id: string;
  status: TInternTaskStatus;
  remark?: string;
}

export interface TTimesheetSubmitPayload {
  /** Today or yesterday (IST), `YYYY-MM-DD`. */
  entry_date: string;
  /** Greater than 0, at most 24. */
  hours: number;
  /** 30–2000 characters. */
  description: string;
  blockers?: string | null;
  end_of_day_note?: string | null;
  task?: TTimesheetTaskInput[];
}

export interface TTimesheetUpdatePayload {
  /** Required on every edit, max 300 characters. */
  edit_reason: string;
  hours?: number;
  description?: string;
  blockers?: string | null;
  end_of_day_note?: string | null;
  /** Replaces the task list. Removed tasks revert to `NOT_STARTED`. */
  task?: TTimesheetTaskInput[];
}

export interface TTimesheetPrefillTask {
  task_id: string;
  title: string;
  category: string;
  deadline: string;
  status: TInternTaskStatus;
  complexity: string;
  output_link: string | null;
  is_overdue: boolean;
}

export interface TTimesheetPrefill {
  tasks: TTimesheetPrefillTask[];
  on_leave: boolean;
}

// ── Monthly review ───────────────────────────────────────────

export type TMonthlyReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

/** Submission window: last 2 days of the month + first 2 days of the next (IST). */
export interface TMonthlyReviewWindow {
  window_open: boolean;
  year: number;
  /** 1–12 */
  month: number;
  month_name: string;
  period_start: string;
  period_end: string;
  opens_on: string;
  closes_on: string;
}

export interface TMonthlyTaskRemarks {
  rating: number | null;
  learnings: string | null;
  challenges_faced: string | null;
  next_month_plan: string | null;
}

export interface TMonthlyReviewTaskCompleted {
  task_id: string;
  title: string;
  category: string;
  complexity: string;
  deadline: string;
  final_status: string;
  output_link: string | null;
}

export interface TMonthlyReview {
  id: string;
  year: number;
  month: number;
  period_start: string;
  period_end: string;
  team: string;
  tasks_completed: TMonthlyReviewTaskCompleted[];
  monthly_review: string;
  task_remarks: TMonthlyTaskRemarks;
  blockers: string | null;
  /** Approved leave days inside the month (calculated by the server). */
  leave_days: number;
  suggestions: string | null;
  status: TMonthlyReviewStatus;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TAdminMonthlyReview extends TMonthlyReview {
  user_id: string;
  user_name: string;
  muid: string;
  reviewed_by_id: string | null;
}

export interface TMonthlyReviewPrefillTask {
  task_id: string;
  title: string;
  category: string;
  complexity: string;
  deadline: string;
  status: string;
  output_link: string | null;
}

export interface TMonthlyReviewPrefill extends TMonthlyReviewWindow {
  existing_review: {
    id: string;
    status: TMonthlyReviewStatus;
    review_note: string | null;
  } | null;
  /** Leave days from the 1st of the month up to today. Display only. */
  leave_days: number;
  tasks: TMonthlyReviewPrefillTask[];
}

export interface TMonthlyReviewCurrent {
  window: TMonthlyReviewWindow;
  review: TMonthlyReview | null;
}

/** POST + PATCH. Month, team, leave_days and tasks are filled by the server. */
export interface TMonthlyReviewPayload {
  /** Max 5000 characters. */
  monthly_review?: string | null;
  /** 1–5 */
  rating?: number | null;
  learnings?: string | null;
  challenges_faced?: string | null;
  next_month_plan?: string | null;
  blockers?: string | null;
  suggestions?: string | null;
}

export interface TInternTask {
  id: string;
  title: string;
  description: string;
  category: string;
  complexity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  complexity_score?: number;
  karma_awarded?: number;
  assigned_to: string;
  assigned_to_name?: string;
  assigned_to_muid?: string;
  status: TInternTaskStatus;
  output_link?: string | null;
  is_verified?: boolean;
  remark?: string | null;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at?: string;
  team?: string;
  guild?: string;
  deadline?: string;
}

export interface TLeaveRequest {
  id: string;
  leave_type: "SICK" | "CASUAL" | "EMERGENCY";
  start_date: string;
  end_date: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  review_note: string | null;
  created_at: string;
  duration_days?: number;
  user_name?: string;
  user_muid?: string;
}

export interface TLeaveSubmitPayload {
  leave_type: "SICK" | "CASUAL" | "EMERGENCY";
  start_date: string;
  end_date: string;
  reason: string;
  duration_days?: number;
}

export interface TLeaveBalanceItem {
  limit: number | null;
  used: number;
  remaining: number | null;
  period: string;
}

export interface TLeaveBalance {
  SICK: TLeaveBalanceItem;
  CASUAL: TLeaveBalanceItem;
  WFH: TLeaveBalanceItem;
  EMERGENCY: TLeaveBalanceItem;
}

export interface TLeaderboardMe {
  rank: number;
  score: number;
}

// ── Admin Manage Types ───────────────────────────────────────

export interface TManageInternItem {
  id: string;
  user: string;
  full_name: string;
  muid: string;
  guild: string;
  role?: "INTERN" | "INTERN_LEAD" | "Intern" | "Intern Lead";
  status: "ACTIVE" | "AT_RISK" | "ON_LEAVE" | "INACTIVE";
  current_status?: "ACTIVE" | "AT_RISK" | "INACTIVE";
  previous_status?: "ACTIVE" | "AT_RISK" | "INACTIVE";
  base_status?: "ACTIVE" | "AT_RISK" | "INACTIVE";
  display_status?: "ACTIVE" | "AT_RISK" | "ON_LEAVE" | "INACTIVE";
  resolved_status?: "ACTIVE" | "AT_RISK" | "ON_LEAVE" | "INACTIVE";
  is_on_leave?: boolean;
  leave_status?: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  active_leave_status?: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  created_at: string;
}

export interface TOnboardInternPayload {
  mu_id?: string;
  user_id?: string;
  guild: string;
  status?: string;
}

export interface TUpdateInternPayload {
  guild?: string;
  status?: string;
  role?: "INTERN" | "INTERN_LEAD" | "Intern" | "Intern Lead";
}

export interface TCreateTaskPayload {
  title: string;
  description: string;
  category: string;
  complexity: string;
  karma_awarded?: number;
  assigned_to: string;
  team?: string;
  deadline?: string;
}

export interface TUpdateTaskPayload {
  title?: string;
  description?: string;
  category?: string;
  complexity?: string;
  karma_awarded?: number;
  assigned_to?: string;
  team?: string;
  deadline?: string;
  status?: string;
  remark?: string;
}

export interface TLeaveReviewPayload {
  action: "approve" | "reject";
  review_note?: string;
}

export interface TMonthlyReviewReviewPayload {
  action: "approve" | "reject";
  /** Max 300 characters. */
  review_note?: string;
}

export interface TBulkImportRowError {
  row: number;
  muid: string;
  reason: string;
  full_name?: string;
  name?: string;
}

export interface TBulkImportRowSuccess {
  row: number;
  muid: string;
  full_name?: string;
  name?: string;
  profile_pic?: string | null;
  guild?: string;
}

export interface TBulkImportResponse {
  success_count: number;
  failed_count: number;
  failed_rows: TBulkImportRowError[];
  success_rows?: TBulkImportRowSuccess[];
}
