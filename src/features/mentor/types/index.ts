export type TimeSlot = {
  start: string; // "HH:mm"
  end: string; // "HH:mm"
};

export type DayAvailability = {
  day: number; // 0=Sun, 1=Mon, ..., 6=Sat
  slots: TimeSlot[];
};

export type WeeklySchedule = DayAvailability[];
