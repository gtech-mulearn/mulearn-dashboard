export interface TrendPoint {
  label: string;
  value: number;
}

export interface StudentLevelCount {
  level: string;
  count: number;
}

export interface CampusOverview {
  collegeName: string;
  campusCode: string;
  campusZone: string;
  campusLevel: number;
  totalKarma: number;
  totalMembers: number;
  activeMembers: number;
  rank: number;
  campusLead: string;
  enabler: string | null;
  karma7Day: number;
  karma30Day: number;
  igChaptersCount: number;
  orgId?: string;
  trend: TrendPoint[];
}

export interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
}

export interface CampusLeaderboardItem {
  id: string;
  name: string;
  muid: string;
  karma: number;
  rank: number;
  level: string;
  ig: string;
  cluster: string;
  alumni: boolean;
}

export interface CampusLeaderboardResponse {
  items: CampusLeaderboardItem[];
  pagination: PaginationInfo;
}

export interface ClusterKarmaPoint {
  cluster: string;
  karma: number;
}

export interface KarmaByClusterItem {
  cluster: string;
  total_karma: number;
}

export interface KarmaByClusterResponse {
  items: KarmaByClusterItem[];
}

export interface EventDistributionPoint {
  tag: string;
  count: number;
}

export interface CampusEvent {
  id: string;
  title: string;
  date: string;
  endDate: string;
  tags: string[];
  interestCount: number;
  status: string;
  type: string;
  scope: string;
  organiserType: string;
  venueType: string;
  venueCity: string;
  coverImage: string | null;
}

export interface CampusEventsResponse {
  items: CampusEvent[];
  pagination: PaginationInfo;
}

export interface IgChapter {
  id: string;
  name: string;
  lead: string;
  membersCount: number;
  execomMembers: string[];
}

export interface ExecomMember {
  id: string;
  name: string;
  muid: string;
  role: string;
  igChapter: string;
  profilePic: string | null;
}

export interface SocialLinks {
  instagram?: string;
  linkedin?: string;
}

export interface CampusLeaderboardFilters {
  orgId?: string;
  page: number;
  search: string;
  ig: string;
  cluster: string;
  alumni: "all" | "alumni" | "student";
}

export interface CampusEventFilters {
  page: number;
  status: string;
  type: string;
  date: string;
}
