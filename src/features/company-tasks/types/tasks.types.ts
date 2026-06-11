export interface CompanyTaskSkill {
  id: string;
  name: string;
  code: string;
}

export interface CompanyTask {
  id: string;
  hashtag: string;
  discord_link?: string | null;
  title: string;
  description: string;
  karma: number;
  channel?: string | null;
  type: string;
  active: boolean;
  variable_karma: boolean;
  usage_count: number;
  level?: string | null;
  org?: string | null;
  ig?: string | null;
  event?: string | null;
  bonus_karma: number;
  bonus_time?: string | null;
  approval_status: "pending" | "approved" | "rejected";
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  requested_by_name: string;
  requested_at: string;
  skills: CompanyTaskSkill[];
  created_at: string;
  updated_at: string;
}

export interface CompanyTasksPagination {
  count: number;
  total_pages: number;
  current_page: number;
  per_page: number;
  next: string | null;
  previous: string | null;
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
  description: string;
  type?: string;
  level?: string;
  created_by?: string;
  updated_by?: string;
  skill_ids?: string[];
}

export interface UpdateCompanyTaskPayload {
  hashtag?: string;
  title?: string;
  karma?: number;
  usage_count?: number;
  description?: string;
  type?: string;
  level?: string;
  skill_ids?: string[];
}
