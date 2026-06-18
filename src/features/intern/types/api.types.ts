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
  daily_streak: number;
  weekly_streak: number;
  completed_tasks: number;
  complexity_score: number;
  score: number;
  join_date?: string;
  longest_daily_streak?: number;
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
}

export interface TTimesheet {
  id: string;
  entry_date: string;
  task_id: string | null;
  category: string;
  description: string;
  hours: string;
  blockers: string;
  task_status: string | null;
  remark: string | null;
  end_of_day_note: string | null;
  edit_reason: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  karma_awarded: number | null;
  score?: number | null;
  review_note: string | null;
  created_at: string;
}

export interface TTimesheetSubmitPayload {
  entry_date: string;
  description: string;
  hours: number;
  blockers?: string;
  end_of_day_note?: string;
  edit_reason?: string;
  task?: Array<{
    task_id: string;
    status: string;
    remark?: string;
  }>;
}

export interface TTimesheetUpdatePayload {
  hours?: number;
  description?: string;
  blockers?: string;
  end_of_day_note?: string;
  edit_reason: string; // mandatory
}

export interface TTimesheetSummary {
  current_streak: number;
  longest_streak: number;
}

export interface TTaskRemarks {
  rating?: number;
  next_week_plan?: string;
  challenges_faced?: string;
  learnings?: string;
}

export interface TWeeklyReview {
  id: string;
  iso_year: number;
  iso_week: number;
  week_start_date: string;
  week_end_date: string;
  team: string;
  is_on_leave: boolean;
  tasks_assigned: Record<string, string> | null;
  tasks_completed: Array<{
    task_id: string;
    title: string;
    category: string;
    complexity: string;
    deadline?: string;
    final_status: string;
    output_link: string;
  }> | null;
  weekly_review: string | null;
  task_remarks: TTaskRemarks | null;
  hours_committed: number;
  blockers: string | null;
  leave_days: number;
  suggestions: string | null;
  is_late: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  karma_awarded: number | null;
  score?: number | null;
  review_note: string | null;
  created_at: string;
  user_name?: string; // admin view
  user_id?: string;
  muid?: string;
}

export interface TWeeklyReviewSubmitPayload {
  team: string;
  is_on_leave: boolean;
  hours_committed: number;
  weekly_review?: string;
  blockers?: string;
  leave_days?: number;
  suggestions?: string;
  rating?: number;
  learnings?: string;
  challenges_faced?: string;
  next_week_plan?: string;
  week_start_date?: string;
}

export interface TWeeklyReviewUpdatePayload {
  blockers?: string;
  suggestions?: string;
  rating?: number;
  weekly_review?: string;
  tasks_assigned?: string;
  tasks_completed?: string;
  hours_committed?: number;
  leave_days?: number;
  learnings?: string;
  challenges_faced?: string;
  next_week_plan?: string;
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
  status: "WAITING_FOR_REVIEW" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD";
  output_link?: string | null;
  is_verified?: boolean;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at?: string;
  team?: string;
  guild?: string;
  deadline?: string;
  iso_week?: number;
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
  iso_week?: number;
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
  iso_week?: number;
  status?: string;
}

export interface TLeaveReviewPayload {
  action: "approve" | "reject";
  review_note?: string;
}

export interface TTimesheetReviewPayload {
  action: "approve" | "reject";
  review_note?: string;
}

export interface TWeeklyReviewReviewPayload {
  action: "approve" | "reject";
  review_note?: string;
}

// ── Minutes Types ─────────────────────────────────────────────

export interface TMinuteItem {
  id: string;
  date: string;
  title: string;
  minutes: string;
  guild: string;
  uploaded_by?: string;
  uploaded_by_name?: string;
  uploaded_by_muid?: string;
  created_by_name?: string;
  created_at: string;
}

export interface TSubmitMinutePayload {
  guild: string;
  date: string;
  title: string;
  minutes: string;
}
