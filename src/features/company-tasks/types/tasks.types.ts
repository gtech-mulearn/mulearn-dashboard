export interface CompanyTaskSkill {
  id: string;
  name: string;
  code?: string | null;
}

export type CompanyTaskApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "changes_requested";

export interface CompanyTask {
  id: string;
  hashtag: string;
  discord_link?: string | null;
  title: string;
  description?: string | null;
  karma: number;
  channel?: string | null;
  type?: string | null;
  active?: boolean;
  variable_karma?: boolean;
  usage_count: number;
  level?: string | null;
  org?: string | null;
  ig?: string | null;
  event?: string | null;
  bonus_karma?: number | null;
  bonus_time?: string | null;
  approval_status: CompanyTaskApprovalStatus;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  requested_by_name?: string | null;
  requested_at?: string | null;
  skills: CompanyTaskSkill[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CompanyTasksPagination {
  page: number;
  per_page: number;
  total: number;
  count?: number;
  total_pages: number;
  current_page: number;
  next?: string | null;
  previous?: string | null;
}

export interface CompanyTasksResponse {
  data: CompanyTask[];
  pagination: CompanyTasksPagination;
}

export interface CreateCompanyTaskPayload {
  hashtag: string;
  title: string;
  karma: number;
  usage_count?: number;
  description?: string;
  type?: string;
  level?: string;
  skill_ids?: string[];
  created_by?: string;
  updated_by?: string;
}

export interface UpdateCompanyTaskPayload {
  title?: string;
  karma?: number;
  usage_count?: number;
  description?: string;
  type?: string;
  level?: string;
  skill_ids?: string[];
  hashtag?: string;
}

export interface CompanyTaskMutationResult {
  approval_status?: string;
  active?: boolean;
  task_id?: string;
  deleted_at?: string;
}
