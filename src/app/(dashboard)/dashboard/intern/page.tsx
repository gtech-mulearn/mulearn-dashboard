import {
  Activity,
  Award,
  BookOpen,
  Calendar,
  ChevronRight,
  Flame,
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

// Mock Data
const MOCK_USER = {
  name: "Alex Doe",
  totalPoints: 1240,
  currentStreak: 14,
  rank: 3,
  activeStatus: "ACTIVE",
};

const MOCK_RECENT_ACTIVITY = [
  {
    id: 1,
    type: "TIMESHEET",
    points: "+10",
    date: "Today, 10:00 AM",
    title: "Daily Timesheet Logged",
  },
  {
    id: 2,
    type: "TIMESHEET_QUALITY",
    points: "+5",
    date: "Today, 11:30 AM",
    title: "Quality Bonus: Detailed Update",
  },
  {
    id: 3,
    type: "TIMESHEET",
    points: "+10",
    date: "Yesterday, 09:45 AM",
    title: "Daily Timesheet Logged",
  },
  {
    id: 4,
    type: "WEEKLY_REVIEW",
    points: "+30",
    date: "Sunday, 11:20 PM",
    title: "Weekly Review Submitted",
  },
  {
    id: 5,
    type: "WEEKLY_QUALITY",
    points: "+15",
    date: "Monday, 09:00 AM",
    title: "Review Quality Bonus",
  },
];

export default function InternDashboardPage() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {MOCK_USER.name} 👋
          </h2>
          <p className="text-muted-foreground mt-1">
            Here's a breakdown of your learning journey and progress.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="px-3 py-1 text-sm font-medium border-success/30 text-success bg-success/10"
          >
            <Activity className="w-4 h-4 mr-1.5" />
            {MOCK_USER.activeStatus}
          </Badge>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Points Card */}
        <Card className="relative overflow-hidden group border-border/50 bg-card transition-all hover:bg-card/80 hover:shadow-sm">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Points
            </CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono tracking-tight text-foreground">
              {MOCK_USER.totalPoints.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-success font-medium flex items-center">
                +45 <ChevronRight className="w-3 h-3" />
              </span>
              from yesterday
            </p>
          </CardContent>
        </Card>

        {/* Streak Card */}
        <Card className="relative overflow-hidden group border-border/50 bg-card transition-all hover:bg-card/80 hover:shadow-sm">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-warning/10 rounded-full blur-2xl group-hover:bg-warning/20 transition-all" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Streak
            </CardTitle>
            <Flame className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono tracking-tight text-foreground">
              {MOCK_USER.currentStreak}{" "}
              <span className="text-lg font-sans text-muted-foreground">
                days
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-secondary overflow-hidden rounded-full">
              <div
                className="h-full bg-warning rounded-full"
                style={{ width: "46%" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              16 days until 30-day bonus (+50 pts)
            </p>
          </CardContent>
        </Card>

        {/* Leaderboard Rank Card */}
        <Card className="relative overflow-hidden group border-border/50 bg-card transition-all hover:bg-card/80 hover:shadow-sm">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-chart-4/10 rounded-full blur-2xl group-hover:bg-chart-4/20 transition-all" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leaderboard Rank
            </CardTitle>
            <Trophy className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono tracking-tight text-foreground">
              #{MOCK_USER.rank}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-success font-medium flex items-center">
                ↑ 2 <ChevronRight className="w-3 h-3" />
              </span>
              positions this week
            </p>
          </CardContent>
        </Card>

        {/* Weekly Completion Card */}
        <Card className="relative overflow-hidden group border-border/50 bg-card transition-all hover:bg-card/80 hover:shadow-sm">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-brand-blue/10 rounded-full blur-2xl group-hover:bg-brand-blue/20 transition-all" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Weekly Progress
            </CardTitle>
            <Target className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono tracking-tight text-foreground">
              4/5{" "}
              <span className="text-lg font-sans text-muted-foreground">
                logs
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-secondary overflow-hidden rounded-full flex gap-0.5">
              {[1, 2, 3, 4, 5].map((day) => (
                <div
                  key={day}
                  className={`h-full flex-1 rounded-full ${day <= 4 ? "bg-brand-blue" : "bg-muted"}`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              1 timesheet left to unlock weekly bonus
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-7">
        {/* Main Content Column (2/3 width) */}
        <div className="md:col-span-4 lg:col-span-5 space-y-6">
          {/* Quick Actions Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/dashboard/intern/timesheet"
              className="block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-xl"
            >
              <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group bg-gradient-to-br from-background to-primary/5">
                <CardContent className="p-6 flex flex-col items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      Log Timesheet
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      Submit your daily work log to earn 10 points and maintain
                      your streak.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link
              href="/dashboard/intern/weekly-review"
              className="block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-xl"
            >
              <Card className="h-full hover:border-brand-blue/50 hover:shadow-md transition-all cursor-pointer group bg-gradient-to-br from-background to-brand-blue/5">
                <CardContent className="p-6 flex flex-col items-start gap-4">
                  <div className="p-3 bg-brand-blue/10 rounded-lg group-hover:bg-brand-blue/20 transition-colors">
                    <LineChart className="w-6 h-6 text-brand-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-brand-blue transition-colors">
                      Weekly Review
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      Complete your weekly reflection before Sunday 23:59 for up
                      to 50 pts.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link
              href="/dashboard/intern/playbook"
              className="block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-xl"
            >
              <Card className="h-full hover:border-brand-purple/50 hover:shadow-md transition-all cursor-pointer group bg-gradient-to-br from-background to-brand-purple/5">
                <CardContent className="p-6 flex flex-col items-start gap-4">
                  <div className="p-3 bg-brand-purple/10 rounded-lg group-hover:bg-brand-purple/20 transition-colors">
                    <BookOpen className="w-6 h-6 text-brand-purple" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-brand-purple transition-colors">
                      Playbook
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      Access guides, resources, and tasks to boost your
                      performance.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Leaderboard Teaser / Monthly Top Intern */}
          <Card className="border-border/50 bg-card flex flex-col">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-warning" />
                    Top Interns This Month
                  </CardTitle>
                  <CardDescription>
                    Current leaders for the monthly challenge
                  </CardDescription>
                </div>
                <Link href="/dashboard/intern/leaderboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex border-warning/30 text-warning hover:bg-warning/10 hover:text-warning"
                  >
                    View Full Board
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {[
                  {
                    rank: 1,
                    name: "Michael Chen",
                    points: 2100,
                    isCurrentUser: false,
                  },
                  {
                    rank: 2,
                    name: "Jessica Wong",
                    points: 1950,
                    isCurrentUser: false,
                  },
                  {
                    rank: 3,
                    name: "Alex Doe",
                    points: 1240,
                    isCurrentUser: true,
                  },
                ].map((intern) => (
                  <div
                    key={intern.rank}
                    className={`p-4 flex items-center justify-between ${intern.isCurrentUser ? "bg-primary/5" : "hover:bg-muted/30"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${intern.rank === 1 ? "bg-warning/20 text-warning" : intern.rank === 2 ? "bg-slate-200 text-slate-700" : "bg-chart-4/20 text-chart-4"}`}
                      >
                        {intern.rank}
                      </div>
                      <div>
                        <p className="font-medium text-foreground flex items-center gap-2">
                          {intern.name}
                          {intern.isCurrentUser && (
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase bg-primary/10 text-primary border-primary/30 px-1 py-0 h-4"
                            >
                              You
                            </Badge>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-foreground">
                      {intern.points.toLocaleString()}{" "}
                      <span className="text-xs text-muted-foreground font-sans font-normal">
                        pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-border/50 sm:hidden">
                <Link
                  href="/dashboard/intern/leaderboard"
                  className="block w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full border-warning/30 text-warning hover:bg-warning/10 hover:text-warning"
                  >
                    View Full Board
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column (1/3 width) */}
        <div className="md:col-span-3 lg:col-span-2 space-y-6">
          <Card className="h-full border-border/50 flex flex-col bg-card">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-muted-foreground" />
                Recent Ledger
              </CardTitle>
              <CardDescription>Your latest points and activity</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              <div className="divide-y divide-border/50">
                {MOCK_RECENT_ACTIVITY.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-4 hover:bg-muted/30 transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.date}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="font-mono bg-primary/10 text-primary hover:bg-primary/20 shrink-0"
                    >
                      {activity.points}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-4 border-t border-border/50 bg-muted/20">
              <Button
                variant="ghost"
                className="w-full text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                View Full Ledger <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
