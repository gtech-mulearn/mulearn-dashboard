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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Table from "@/components/dashboard/table/Table";

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

export default function InternDashboardPage() {
  const performerColumns = [
    {
      column: "name",
      Label: "Intern",
      isSortable: false,
      wrap: (data: any, id: string, row: any) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{data}</span>
          {row.name === "Alex Doe" && (
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
      wrap: (data: any) => (
        <div className="flex items-center gap-1 font-mono font-bold">
          <Gem className="w-3 h-3 text-brand-blue" />
          {data}
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto w-full bg-background/50">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {MOCK_USER.level}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border border-border">
              <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center text-[10px] text-white font-bold">
                ✓
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
              Welcome back, {MOCK_USER.name}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-purple to-brand-blue"
                  style={{ width: `${MOCK_USER.exp}%` }}
                />
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Level {MOCK_USER.level} &bull; {MOCK_USER.exp}% EXP
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="px-4 py-1.5 text-sm font-bold border-success/30 text-success bg-success/5 rounded-full"
          >
            <div className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse" />
            {MOCK_USER.activeStatus}
          </Badge>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Points Card */}
        <Card className="relative overflow-hidden group border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:shadow-xl hover:-translate-y-1">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-brand-blue/10 rounded-full blur-3xl group-hover:bg-brand-blue/20 transition-all" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Gems
            </CardTitle>
            <Gem className="h-4 w-4 text-brand-blue animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-mono tracking-tighter text-foreground flex items-center gap-2">
              <Gem className="w-6 h-6 text-brand-blue" />
              {MOCK_USER.totalPoints.toLocaleString()}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="text-success">+45</span> earned in last 24h
            </p>
          </CardContent>
        </Card>

        {/* Streak Card */}
        <Card className="relative overflow-hidden group border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:shadow-xl hover:-translate-y-1">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-warning/10 rounded-full blur-3xl group-hover:bg-warning/20 transition-all" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Hot Streak
            </CardTitle>
            <Flame className="h-4 w-4 text-warning fill-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-mono tracking-tighter text-foreground flex items-baseline gap-1">
              {MOCK_USER.currentStreak}
              <span className="text-sm font-bold text-muted-foreground uppercase">
                DAYS
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-muted overflow-hidden rounded-full p-[1px]">
              <div
                className="h-full bg-gradient-to-r from-warning to-destructive rounded-full"
                style={{ width: "46%" }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest">
              Level up in 16 days (+50 Gems)
            </p>
          </CardContent>
        </Card>

        {/* Leaderboard Rank Card */}
        <Card className="relative overflow-hidden group border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:shadow-xl hover:-translate-y-1">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-brand-purple/10 rounded-full blur-3xl group-hover:bg-brand-purple/20 transition-all" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Global Rank
            </CardTitle>
            <Trophy className="h-4 w-4 text-brand-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-mono tracking-tighter text-foreground">
              #{MOCK_USER.rank}
            </div>
            <p className="text-[10px] text-success mt-2 font-bold uppercase tracking-widest flex items-center gap-1">
              <ChevronRight className="w-3 h-3 -rotate-90" /> 2 POSITIONS
              CLIMBED
            </p>
          </CardContent>
        </Card>

        {/* Weekly Completion Card */}
        <Card className="relative overflow-hidden group border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:shadow-xl hover:-translate-y-1">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-success/10 rounded-full blur-3xl group-hover:bg-success/20 transition-all" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Weekly Quests
            </CardTitle>
            <Target className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-mono tracking-tighter text-foreground">
              4/5
              <span className="text-sm font-bold text-muted-foreground uppercase ml-1">
                COMPLETE
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-muted overflow-hidden rounded-full flex gap-1">
              {[1, 2, 3, 4, 5].map((day) => (
                <div
                  key={day}
                  className={`h-full flex-1 rounded-full ${day <= 4 ? "bg-success" : "bg-muted-foreground/20"}`}
                />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest">
              1 QUEST LEFT FOR BONUS CHEST
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Main Content Column (2/3 width) */}
        <div className="md:col-span-4 lg:col-span-5 space-y-8">
          {/* Active Quests (Quick Actions) */}
          <div className="space-y-4">
            <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-5 h-5 text-warning fill-warning" />
              Active Quests
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/dashboard/intern/timesheet">
                <Card className="h-full border-2 border-transparent hover:border-brand-blue/50 bg-gradient-to-br from-card to-brand-blue/5 transition-all cursor-pointer group shadow-lg hover:shadow-brand-blue/10">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <div className="p-4 bg-brand-blue/10 rounded-2xl group-hover:scale-110 transition-transform">
                      <Calendar className="w-8 h-8 text-brand-blue" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg group-hover:text-brand-blue transition-colors uppercase tracking-tight">
                        Daily Log
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">
                        Log today's work to earn{" "}
                        <Gem className="inline w-3 h-3" /> 10
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/intern/weekly-review">
                <Card className="h-full border-2 border-transparent hover:border-brand-purple/50 bg-gradient-to-br from-card to-brand-purple/5 transition-all cursor-pointer group shadow-lg hover:shadow-brand-purple/10">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <div className="p-4 bg-brand-purple/10 rounded-2xl group-hover:scale-110 transition-transform">
                      <LineChart className="w-8 h-8 text-brand-purple" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg group-hover:text-brand-purple transition-colors uppercase tracking-tight">
                        Reflection
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">
                        Weekly summary for up to{" "}
                        <Gem className="inline w-3 h-3" /> 50
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="http://mulearn.org/r/internplaybook" target="_blank">
                <Card className="h-full border-2 border-transparent hover:border-warning/50 bg-gradient-to-br from-card to-warning/5 transition-all cursor-pointer group shadow-lg hover:shadow-warning/10">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <div className="p-4 bg-warning/10 rounded-2xl group-hover:scale-110 transition-transform">
                      <BookOpen className="w-8 h-8 text-warning" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg group-hover:text-warning transition-colors uppercase tracking-tight">
                        Playbook
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">
                        Unlock new skills & secret strategies
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Top Performers (Table Integration) */}
          <Card className="border-border/40 bg-card/40 backdrop-blur-md overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-warning" />
                  Elite Leaders
                </CardTitle>
                <CardDescription className="text-xs font-bold uppercase text-muted-foreground/60 tracking-tight">
                  Monthly Hall of Fame
                </CardDescription>
              </div>
              <Link href="/dashboard/intern/leaderboard">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs font-bold uppercase tracking-widest hover:bg-warning/10 hover:text-warning"
                >
                  Full Board <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table
                rows={MOCK_TOP_PERFORMERS}
                page={1}
                perPage={5}
                columnOrder={performerColumns}
                id={["id"]}
                slNoCellClassName="font-black text-muted-foreground w-12"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column (1/3 width) */}
        <div className="md:col-span-3 lg:col-span-2">
          <Card className="h-full border-border/40 bg-card/40 backdrop-blur-md flex flex-col">
            <CardHeader className="pb-4 border-b border-border/20">
              <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-5 h-5 text-muted-foreground" />
                Quest Log
              </CardTitle>
              <CardDescription className="text-xs font-bold uppercase text-muted-foreground/60">
                Recent XP Gains
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="divide-y divide-border/20">
                {MOCK_RECENT_ACTIVITY.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-4 hover:bg-muted/30 transition-all flex items-start justify-between gap-4 group"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {activity.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                        {activity.date}
                      </p>
                    </div>
                    <Badge className="font-black bg-brand-blue/10 text-brand-blue border-none rounded-lg px-2 py-1">
                      {activity.points}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-4 border-t border-border/20">
              <Button
                variant="outline"
                className="w-full text-[10px] font-black uppercase tracking-[0.2em] border-border/50 hover:bg-muted"
              >
                View History
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
