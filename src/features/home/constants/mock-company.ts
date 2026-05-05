// Mock company home data — delete when backend Issues #job-stats, #talent-pool land.

export const MOCK_COMPANY_QUICK_STATS = {
  jobsPosted: { value: 5, label: "Jobs Posted" },
  totalViews: { value: 2840, label: "Total Views" },
  applications: { value: 137, label: "Applications" },
  hired: { value: 4, label: "Hired" },
} as const;

export const MOCK_COMPANY_STAT_CARDS = {
  jobViews: {
    value: "2,840",
    delta: "+340 this week",
    deltaColor: "emerald" as const,
  },
  applications: {
    value: "137",
    delta: "+28 pending review",
    deltaColor: "emerald" as const,
  },
  talentPool: {
    value: "14,200+",
    delta: "Verified learners",
    deltaColor: "blue" as const,
  },
  avgKarma: {
    value: "4.2k",
    delta: "Pool median karma",
    deltaColor: "blue" as const,
  },
} as const;

export type LevelBarItem = { level: string; count: number; color: string };

export const MOCK_LEVEL_DISTRIBUTION: LevelBarItem[] = [
  { level: "L1", count: 4970, color: "#374151" },
  { level: "L2", count: 4260, color: "#6366f1" },
  { level: "L3", count: 2840, color: "#a855f7" },
  { level: "L4", count: 1420, color: "#f59e0b" },
  { level: "L5+", count: 710, color: "#10b981" },
];

export const MOCK_LEVEL_DISTRIBUTION_TOTAL = 14200;

export type TopIGItem = {
  id: string;
  name: string;
  karma: number;
  color: string;
};

export const MOCK_TOP_INTEREST_GROUPS: TopIGItem[] = [
  { id: "1", name: "Web Development", karma: 3800, color: "#6366f1" },
  { id: "2", name: "UI/UX Design", karma: 2100, color: "#a855f7" },
  { id: "3", name: "Cloud & DevOps", karma: 1900, color: "#10b981" },
  { id: "4", name: "AI/ML", karma: 1600, color: "#f59e0b" },
];

export const MOCK_TOP_IG_MAX_KARMA = 3800;

export const MOCK_VERIFIED_COMPANY_NAME = "TechLaunch Ltd.";
export const MOCK_TOTAL_LEARNERS = "14,200+";
