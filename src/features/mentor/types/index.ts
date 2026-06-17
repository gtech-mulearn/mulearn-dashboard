export type TimeSlot = {
  start: string; // "HH:mm"
  end: string; // "HH:mm"
};

export type DayAvailability = {
  /**
   * Weekday number per doc: 1=Monday … 7=Sunday
   * (previously used 0–6 which was incorrect)
   */
  day: number;
  slots: TimeSlot[];
};

export type WeeklySchedule = DayAvailability[];

export type AvailabilityCalendarSlot = {
  id: string;
  mentor_user_id: string;
  mentor_full_name?: string;
  mentor_name?: string;
  ig_id?: string | null;
  ig_name?: string | null;
  /** 1=Monday … 7=Sunday (per doc) */
  weekday: number;
  start_time: string;
  end_time: string;
  timezone?: string;
  is_active?: boolean;
  valid_from?: string | null;
  valid_to?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type MentorScopeMetrics = {
  completed_sessions?: number;
  active_learners?: number;
  active_ig_learners?: number;
  pending_task_reviews?: number;
  pending_appraisals?: number;
  pending_tasks?: number;
  [key: string]: number | undefined;
};

export type MentorScope = {
  scope_name: string;
  scope_type: string;
  metrics: MentorScopeMetrics;
};

export type MentorOverview = {
  scopes: MentorScope[];
};

export type MentorStatus = {
  status: "APPROVED" | "PENDING" | "REJECTED" | string;
  organization?: string | null;
};
