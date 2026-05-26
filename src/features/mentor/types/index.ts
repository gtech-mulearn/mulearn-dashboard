export type TimeSlot = {
  start: string; // "HH:mm"
  end: string; // "HH:mm"
};

export type DayAvailability = {
  day: number; // 0=Sun, 1=Mon, ..., 6=Sat
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
  weekday: number;
  start_time: string;
  end_time: string;
  timezone?: string;
  is_active?: boolean;
  valid_from?: string | null;
  valid_to?: string | null;
  created_at?: string;
};
