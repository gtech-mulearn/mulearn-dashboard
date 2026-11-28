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

// ── Teams ────────────────────────────────────────────────────

/** Compact team reference embedded in most intern rows. */
export interface TTeamRef {
  id: string;
  name: string;
  code: string;
  is_active?: boolean;
}

/** Who reviewed a timesheet / leave / monthly review. */
export interface TReviewer {
  id: string;
  full_name: string;
  muid: string;
}

export interface TTeamLead {
  full_name: string;
  muid: string;
  profile_pic: string | null;
}

/** Full team object from `manage-interns/teams/`. */
export interface TTeam {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  deactivated_at: string | null;
  member_count: number;
  active_member_count: number;
  leads: TTeamLead[];
  created_at: string;
  updated_at: string;
}

export interface TTeamPayload {
  name?: string;
  /** 2–10 letters or digits; saved uppercase. */
  code?: string;
  description?: string | null;
}

export interface TTeamMember {
  full_name: string;
  muid: string;
  profile_pic: string | null;
  is_lead: boolean;
}

export interface TMyTeamMembers extends TPaginatedData<TTeamMember> {
  team: TTeamRef;
}

export interface TInternOverviewStatus {
  team: TTeamRef | null;
  status: string;
  join_date?: string;
  total_intern_karma: number;
  completed_tasks: number;
  complexity_score: number;
  score?: number;
  total_interns?: number;
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
  review_note: string | null;
  reviewed_by: TReviewer | null;
  reviewed_at: string | null;
  team: TTeamRef | null;
  /** Intern view only: false when logged under a previous team. */
  is_current_team?: boolean;
  created_at: string;
  score?: number;
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
  team: TTeamRef | null;
  tasks_completed: TMonthlyReviewTaskCompleted[];
  monthly_review: string;
  task_remarks: TMonthlyTaskRemarks;
  blockers: string | null;
  /** Approved leave days inside the month (calculated by the server). */
  leave_days: number;
  suggestions: string | null;
  status: TMonthlyReviewStatus;
  review_note: string | null;
  reviewed_by: TReviewer | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TAdminMonthlyReview extends TMonthlyReview {
  user_id: string;
  user_name: string;
  muid: string;
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
  team: TTeamRef | null;
  deadline?: string;
}

export interface TLeaveRequest {
  id: string;
  leave_type: "SICK" | "CASUAL" | "EMERGENCY";
  start_date: string;
  end_date: string;
  reason: string;
  team?: TTeamRef | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  review_note: string | null;
  reviewed_by?: TReviewer | null;
  reviewed_at?: string | null;
  created_at: string;
  duration_days?: number;
  user?: string;
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

export type TInternStatus = "ACTIVE" | "AT_RISK" | "ON_LEAVE" | "INACTIVE";

/** Row of `manage-interns/interns/`. Keyed by `user` (user id). */
export interface TManageInternItem {
  user: string;
  full_name: string;
  muid: string;
  team: TTeamRef | null;
  status: TInternStatus;
  status_reason: string | null;
  join_date: string | null;
  end_date: string | null;
  tenure_state: string | null;
  days_left: number | null;
  is_current: boolean;
  exit_reason: string | null;
  is_lead: boolean;
  roles: string[];
  created_at: string;
}

export interface TInternCurrentTeam {
  team: TTeamRef;
  status: TInternStatus;
  status_reason: string | null;
  is_lead: boolean;
  roles: string[];
  join_date: string | null;
  end_date: string | null;
  tenure_state: string | null;
  joined_at: string;
}

export interface TInternPreviousTeam {
  team: TTeamRef;
  exit_reason: string | null;
  join_date: string | null;
  end_date: string | null;
  joined_at: string;
  left_at: string | null;
}

/** `GET manage-interns/interns/<user_id>/` */
export interface TInternDetail {
  user: string;
  full_name: string;
  muid: string;
  current_team: TInternCurrentTeam | null;
  previous_teams: TInternPreviousTeam[];
}

export interface TOnboardInternPayload {
  mu_id?: string;
  user_id?: string;
  team_id: string;
  join_date: string;
  end_date: string;
}

/** Send at least one of `status`, `is_lead`, `end_date`. `reason` is required with `status`. */
export interface TUpdateInternPayload {
  status?: "ACTIVE" | "AT_RISK" | "INACTIVE";
  reason?: string;
  is_lead?: boolean;
  end_date?: string;
}

export interface TReassignInternsPayload {
  user_ids: string[];
  team_id: string;
  end_date: string;
}

export interface TReassignInternsResponse {
  moved_count: number;
  /** MUIDs skipped because they were already in the team. */
  already_in_team: string[];
  leads_moved: { full_name: string; muid: string; from_team: string }[];
}

export interface TCreateTaskPayload {
  title: string;
  description: string;
  category: string;
  complexity: string;
  assigned_to: string;
  deadline?: string;
}

export interface TUpdateTaskPayload {
  title?: string;
  description?: string;
  category?: string;
  complexity?: string;
  assigned_to?: string;
  deadline?: string;
  status?: string;
  remark?: string;
}

// ── Missing reports ──────────────────────────────────────────

export interface TMissingTimesheetRow {
  user: string;
  full_name: string;
  muid: string;
  team: TTeamRef | null;
  status: TInternStatus;
  on_leave: boolean;
  leave_type: string | null;
}

export interface TMissingTimesheets
  extends TPaginatedData<TMissingTimesheetRow> {
  date: string;
  is_weekend: boolean;
  can_still_submit: boolean;
}

export interface TMissingMonthlyReviewRow {
  user: string;
  full_name: string;
  muid: string;
  team: TTeamRef | null;
  status: TInternStatus;
  leave_days: number;
}

export interface TMissingMonthlyReviews
  extends TPaginatedData<TMissingMonthlyReviewRow> {
  year: number;
  month: number;
  window_open: boolean;
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
  team?: string;
}

export interface TBulkImportResponse {
  /** Onboarded + promoted. */
  success_count: number;
  promoted_count?: number;
  failed_count: number;
  failed_rows: TBulkImportRowError[];
  success_rows?: TBulkImportRowSuccess[];
}
