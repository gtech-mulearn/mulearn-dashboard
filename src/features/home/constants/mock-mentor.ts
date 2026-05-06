// Mock mentor home data — delete when dashboard/mentor/* backend Issues land.

export const MOCK_MENTOR_STAT_DELTAS = {
  activeMentees: { value: 12, delta: "+2 this month" },
  hoursMentored: { value: "48h", delta: "+6h this week" },
  avgRating: { value: "4.8", delta: "★ out of 5.0" },
  completionRate: { value: "92%", delta: "+4% vs last month" },
} as const;

export type SessionStatus = "confirmed" | "pending" | "cancelled";

export type UpcomingSession = {
  id: string;
  menteeName: string;
  menteeInitials: string;
  avatarColor: string;
  topic: string;
  dateLabel: string;
  timeLabel: string;
  status: SessionStatus;
};

export const MOCK_UPCOMING_SESSIONS: UpcomingSession[] = [
  {
    id: "1",
    menteeName: "Arjun Joshi",
    menteeInitials: "AJ",
    avatarColor: "#6366f1",
    topic: "Career roadmap",
    dateLabel: "Tomorrow",
    timeLabel: "4:00 PM",
    status: "confirmed",
  },
  {
    id: "2",
    menteeName: "Meera K.",
    menteeInitials: "MK",
    avatarColor: "#10b981",
    topic: "Resume review",
    dateLabel: "May 8",
    timeLabel: "6:30 PM",
    status: "confirmed",
  },
  {
    id: "3",
    menteeName: "Rohan P.",
    menteeInitials: "RP",
    avatarColor: "#f59e0b",
    topic: "Interview prep",
    dateLabel: "May 10",
    timeLabel: "5:00 PM",
    status: "pending",
  },
  {
    id: "4",
    menteeName: "Divya Menon",
    menteeInitials: "DM",
    avatarColor: "#a855f7",
    topic: "Open source contribution",
    dateLabel: "May 12",
    timeLabel: "7:00 PM",
    status: "confirmed",
  },
];

export type SessionRequest = {
  id: string;
  menteeName: string;
  menteeInitials: string;
  avatarColor: string;
  muid: string;
  topic: string;
  timeAgo: string;
};

export const MOCK_SESSION_REQUESTS: SessionRequest[] = [
  {
    id: "r1",
    menteeName: "Nisha M.",
    menteeInitials: "NM",
    avatarColor: "#ec4899",
    muid: "nisha@24",
    topic: "Frontend career path",
    timeAgo: "2h ago",
  },
  {
    id: "r2",
    menteeName: "Abin Jose",
    menteeInitials: "AJ",
    avatarColor: "#3b82f6",
    muid: "abin@23",
    topic: "Python & ML basics",
    timeAgo: "5h ago",
  },
  {
    id: "r3",
    menteeName: "Swathi R.",
    menteeInitials: "SR",
    avatarColor: "#06b6d4",
    muid: "swathi@24",
    topic: "Open source contribution",
    timeAgo: "1d ago",
  },
];

export type MenteeProgress = {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  level: string;
  karmaEarned: number;
  karmaTarget: number;
};

export const MOCK_MENTEE_PROGRESS: MenteeProgress[] = [
  {
    id: "m1",
    name: "Arjun Joshi",
    initials: "AJ",
    avatarColor: "#6366f1",
    level: "L2",
    karmaEarned: 3200,
    karmaTarget: 5000,
  },
  {
    id: "m2",
    name: "Meera K.",
    initials: "MK",
    avatarColor: "#10b981",
    level: "L3",
    karmaEarned: 6800,
    karmaTarget: 8000,
  },
  {
    id: "m3",
    name: "Rohan P.",
    initials: "RP",
    avatarColor: "#f59e0b",
    level: "L2",
    karmaEarned: 2900,
    karmaTarget: 5000,
  },
  {
    id: "m4",
    name: "Divya Menon",
    initials: "DM",
    avatarColor: "#a855f7",
    level: "L1",
    karmaEarned: 1200,
    karmaTarget: 2000,
  },
  {
    id: "m5",
    name: "Nisha M.",
    initials: "NM",
    avatarColor: "#ec4899",
    level: "L1",
    karmaEarned: 800,
    karmaTarget: 2000,
  },
];

export const MOCK_EXPERTISE_TAGS = [
  "React",
  "TypeScript",
  "Node.js",
  "System Design",
  "Career Planning",
  "Open Source",
  "Python",
  "Interview Prep",
] as const;

export const MOCK_MENTOR_NEXT_SESSION = {
  name: "Arjun Joshi",
  dateLabel: "tomorrow at 4:00 PM",
} as const;
