export interface CampusInfo {
  college_name: string;
  campus_code: string;
  campus_zone: string;
  campus_level: number;
  total_karma: number;
  total_members: number;
  active_members: number;
  rank: number;
}

export interface WeeklyKarma {
  college_name: string;
  [date: string]: string | number | null;
}

export interface WeeklyKarmaDay {
  date: string;
  value: number;
}

export interface WeeklyKarmaCardProps {
  data: WeeklyKarmaDay[];
}

export interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

export interface CampusDashboardProps {
  id: string;
}
