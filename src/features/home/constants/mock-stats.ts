// src/features/home/constants/mock-stats.ts

export const MOCK_STATS = {
  karma: {
    total: 4821,
    thisWeek: 340,
    deltaPct: 12, // positive = green badge
  },
  rank: {
    current: 142,
    delta: -8, // negative number = rank improved (display as -8)
  },
  activeCircles: {
    count: 7,
    delta: 2,
  },
  streak: {
    days: 14,
  },
} as const;

export const MOCK_NEXT_MEETING = {
  circleName: "Web Dev Circle",
  dateLabel: "tomorrow at 6 PM",
} as const;

export const MOCK_QUICK_ACTION_COUNTS = {
  myCircles: 7, // active circle count
  leaderboardRank: 142,
  jobOpenings: 12,
} as const;
