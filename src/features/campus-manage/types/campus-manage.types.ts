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
  clusterData: ClusterKarmaPoint[];
  socialLinks?: SocialLinks;
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
  profilePic: string | null;
  igCount: number;
  department: string;
  graduationYear: string;
  joinDate: string;
  lastKarmaGained: string;
}

export interface CampusLeaderboardResponse {
  items: CampusLeaderboardItem[];
  pagination: PaginationInfo;
}

export interface ClusterKarmaPoint {
  cluster: string;
  karma: number;
  memberCount: number;
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
  igId?: string;
  name: string;
  code?: string;
  icon?: string;
  iconLink?: string;
  leadId?: string;
  lead: string;
  membersCount: number;
  description?: string;
  isActive?: boolean;
  execomMembers: string[];
}

export interface ExecomMember {
  id: string;
  roleLinkId: string;
  name: string;
  muid: string;
  role: string;
  igChapter: string;
  profilePic: string | null;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface SocialLinks {
  instagram?: SocialLink;
  linkedin?: SocialLink;
  github?: SocialLink;
  website?: SocialLink;
  twitter?: SocialLink;
  facebook?: SocialLink;
  youtube?: SocialLink;
  discord?: SocialLink;
  other?: SocialLink;
  items: SocialLink[];
  [key: string]: SocialLink | SocialLink[] | undefined;
}

export interface CampusLeaderboardFilters {
  orgId?: string;
  page: number;
  search: string;
  ig: string;
  category: string;
  alumni: "all" | "alumni" | "student";
}

export interface CampusEventFilters {
  page: number;
  status: string;
  type: string;
  date: string;
}
