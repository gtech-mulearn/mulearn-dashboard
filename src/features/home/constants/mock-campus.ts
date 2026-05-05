// Mock campus data — delete this file when backend Issues #funnel, #circle-health, #activity-feed land.

export type FunnelStage = {
  label: string;
  value: number;
  color: string; // hex
};

export const MOCK_CAMPUS_FUNNEL: FunnelStage[] = [
  { label: "Registered", value: 312, color: "#6366f1" },
  { label: "Onboarded", value: 248, color: "#8b5cf6" },
  { label: "Active", value: 142, color: "#3b82f6" },
  { label: "Level 2+", value: 86, color: "#10b981" },
  { label: "Circle Lead", value: 12, color: "#06b6d4" },
];

export const MOCK_CAMPUS_FUNNEL_MAX = 312; // Registered count is the 100% baseline

export type CircleHealthStatus = "active" | "slow" | "inactive";

export type CircleHealthItem = {
  id: string;
  name: string;
  memberCount: number;
  sessionsPerMonth: number;
  status: CircleHealthStatus;
};

export const MOCK_CIRCLE_HEALTH: CircleHealthItem[] = [
  {
    id: "1",
    name: "Web Dev SJCET",
    memberCount: 31,
    sessionsPerMonth: 8,
    status: "active",
  },
  {
    id: "2",
    name: "AI/ML Circle",
    memberCount: 18,
    sessionsPerMonth: 5,
    status: "active",
  },
  {
    id: "3",
    name: "Cloud Builders",
    memberCount: 24,
    sessionsPerMonth: 3,
    status: "slow",
  },
  {
    id: "4",
    name: "Design Circle",
    memberCount: 12,
    sessionsPerMonth: 1,
    status: "inactive",
  },
  {
    id: "5",
    name: "Game Dev SJCET",
    memberCount: 22,
    sessionsPerMonth: 6,
    status: "active",
  },
];

export type ActivityType =
  | "level_up"
  | "circle_created"
  | "member_joined"
  | "karma_voucher";

export type ActivityItem = {
  id: string;
  type: ActivityType;
  text: string;
  timeAgo: string;
};

export const MOCK_RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "1",
    type: "level_up",
    text: "Arjun Joshi completed Level 2",
    timeAgo: "2h ago",
  },
  {
    id: "2",
    type: "circle_created",
    text: "New circle: Robotics SJCET created",
    timeAgo: "4h ago",
  },
  {
    id: "3",
    type: "member_joined",
    text: "Divya Menon joined Web Dev Circle",
    timeAgo: "5h ago",
  },
  {
    id: "4",
    type: "karma_voucher",
    text: "4 karma vouchers submitted for review",
    timeAgo: "1d ago",
  },
  {
    id: "5",
    type: "level_up",
    text: "Meera K. completed Level 3",
    timeAgo: "1d ago",
  },
  {
    id: "6",
    type: "member_joined",
    text: "Rohan P. joined AI/ML Circle",
    timeAgo: "2d ago",
  },
];

export const MOCK_CAMPUS_STAT_DELTAS = {
  activeMembers: { pct: 18, label: "+18% this month" },
  campusKarma: { abs: 12000, label: "+12k this week" },
  activeCircles: { abs: 2, label: "+2 new circles" },
  campusRank: { from: 5, label: "↑ from #5 last month" },
} as const;
