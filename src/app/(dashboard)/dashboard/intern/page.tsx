"use client";

import {
  Activity,
  BookOpen,
  Calendar,
  ChevronRight,
  Flame,
  Gem,
  LineChart,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type { ReactElement } from "react";
import Table, { type Data } from "@/components/dashboard/table/Table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Mock Data
const MOCK_USER = {
  name: "Alex Doe",
  totalPoints: 1240,
  currentStreak: 14,
  rank: 3,
  activeStatus: "ACTIVE",
  level: 12,
  exp: 75,
};

const MOCK_RECENT_ACTIVITY = [
  {
    id: 1,
    type: "TIMESHEET",
    points: "+10",
    date: "Today, 10:00 AM",
    title: "Daily Quest: Log Timesheet",
  },
  {
    id: 2,
    type: "TIMESHEET_QUALITY",
    points: "+5",
    date: "Today, 11:30 AM",
    title: "Critical Hit: Detailed Update Bonus",
  },
  {
    id: 3,
    type: "TIMESHEET",
    points: "+10",
    date: "Yesterday, 09:45 AM",
    title: "Daily Quest: Log Timesheet",
  },
  {
    id: 4,
    type: "WEEKLY_REVIEW",
    points: "+30",
    date: "Sunday, 11:20 PM",
    title: "Epic Quest: Weekly Review",
  },
];

const MOCK_TOP_PERFORMERS = [
  {
    id: "1",
    rank: 1,
    name: "Michael Chen",
    points: 2100,
  },
  {
    id: "2",
    rank: 2,
    name: "Jessica Wong",
    points: 1950,
  },
  {
    id: "3",
    rank: 3,
    name: "Alex Doe",
    points: 1240,
  },
];

interface Performer {
  id: string;
  rank: number;
  name: string;
  points: number;
}

export default function InternDashboardPage() {
  const performerColumns = [
    {
      column: "name",
      Label: "Intern",
      isSortable: false,
      wrap: (
        data: string | import("react").ReactElement,
        _id: string,
        row: Data,
      ) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{data}</span>
          {(row.name as string) === "Alex Doe" && (
            <Badge
              variant="outline"
              className="text-[10px] bg-primary/10 text-primary border-primary/30 h-4"
            >
              YOU
            </Badge>
          )}
        </div>
      ),
    },
    {
      column: "points",
      Label: "Points",
      isSortable: false,
      wrap: (data: string | import("react").ReactElement) => (
        <div className="flex items-center gap-1 font-mono font-bold">
          <Gem className="w-3 h-3 text-brand-blue" />
          {data}
        </div>
      ),
    },
  ];

export default function InternPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <Construction className="h-12 w-12 text-muted-foreground/40" />
      <div>
        <h2 className="text-xl font-bold">Coming Soon</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The Intern module is under development.
        </p>
      </div>
    </div>
  );
}
