export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface CampusLead {
  user_id: string;
  full_name: string;
  muid: string;
  profile_pic?: string | null;
  role: string;
}

export interface ExecomMember {
  user_id: string;
  full_name: string;
  muid: string;
  role_title: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  muid: string;
  profile_pic?: string | null;
  karma: number;
}

export interface IgChapterLead {
  user_id: string;
  full_name: string;
  muid: string;
}

export interface ActiveIgChapter {
  ig_chapter_id: string;
  ig_name: string;
  ig_code: string;
  lead: IgChapterLead | null;
  member_count: number;
}

export interface ClusterKarma {
  total_karma: number;
  member_count: number;
}

export type KarmaByCluster = Record<string, ClusterKarma>;

export interface CampusInfo {
  college_name: string;
  campus_code: string;
  campus_zone: string;
  total_karma: number;
  total_members: number;
  active_members: number;
  rank: number;
  social_links?: SocialLink[];
  campus_lead?: CampusLead | null;
  execom?: ExecomMember[];
  top_10_campus_leaderboard?: LeaderboardEntry[];
  active_ig_chapters?: ActiveIgChapter[];
  karma_by_cluster?: KarmaByCluster;
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
