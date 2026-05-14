import { Flame, Medal, Search, Trophy } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LeaderboardPage() {
  const MOCK_LEADERBOARD = [
    {
      rank: 1,
      name: "Michael Chen",
      team: "Design",
      points: 2100,
      streak: 28,
      trend: "up",
      avatar: "MC",
    },
    {
      rank: 2,
      name: "Jessica Wong",
      team: "Backend",
      points: 1950,
      streak: 15,
      trend: "same",
      avatar: "JW",
    },
    {
      rank: 3,
      name: "Alex Doe",
      team: "Frontend",
      points: 1240,
      streak: 14,
      trend: "up",
      avatar: "AD",
    },
    {
      rank: 4,
      name: "Emma Wilson",
      team: "Frontend",
      points: 920,
      streak: 5,
      trend: "down",
      avatar: "EW",
    },
    {
      rank: 5,
      name: "Sarah Smith",
      team: "Backend",
      points: 850,
      streak: 0,
      trend: "down",
      avatar: "SS",
    },
    {
      rank: 6,
      name: "David Kim",
      team: "Mobile",
      points: 810,
      streak: 2,
      trend: "up",
      avatar: "DK",
    },
    {
      rank: 7,
      name: "Lisa Brown",
      team: "Design",
      points: 790,
      streak: 4,
      trend: "same",
      avatar: "LB",
    },
  ];

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Trophy className="w-8 h-8 text-warning" />
            Global Leaderboard
          </h2>
          <p className="text-muted-foreground mt-1">
            See how you stack up against other interns this month.
          </p>
        </div>
        <Tabs defaultValue="month" className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Podium Top 3 */}
      <div className="flex flex-col md:flex-row items-end justify-center gap-4 py-8">
        {/* Rank 2 */}
        <div className="flex flex-col items-center order-2 md:order-1 w-full md:w-1/3 max-w-[200px]">
          <Avatar className="w-16 h-16 border-4 border-slate-300 shadow-lg mb-4">
            <AvatarFallback className="bg-slate-200 text-slate-700 text-lg font-bold">
              {MOCK_LEADERBOARD[1].avatar}
            </AvatarFallback>
          </Avatar>
          <div className="bg-gradient-to-t from-slate-200 to-slate-100 w-full rounded-t-xl border border-slate-300 p-4 text-center flex flex-col items-center justify-end h-[140px] shadow-sm relative">
            <Medal className="w-8 h-8 text-slate-400 absolute -top-4 bg-white rounded-full p-1 border border-slate-200" />
            <h3 className="font-bold text-slate-800">
              {MOCK_LEADERBOARD[1].name}
            </h3>
            <p className="text-xs text-slate-500 mb-2">
              {MOCK_LEADERBOARD[1].team}
            </p>
            <Badge variant="secondary" className="font-mono">
              {MOCK_LEADERBOARD[1].points} pts
            </Badge>
          </div>
        </div>

        {/* Rank 1 */}
        <div className="flex flex-col items-center order-1 md:order-2 w-full md:w-1/3 max-w-[220px]">
          <Avatar className="w-20 h-20 border-4 border-warning shadow-xl mb-4 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">
              👑
            </div>
            <AvatarFallback className="bg-warning/20 text-warning text-xl font-bold">
              {MOCK_LEADERBOARD[0].avatar}
            </AvatarFallback>
          </Avatar>
          <div className="bg-gradient-to-t from-warning/30 to-warning/10 w-full rounded-t-xl border border-warning/50 p-4 text-center flex flex-col items-center justify-end h-[180px] shadow-md relative">
            <Medal className="w-10 h-10 text-warning absolute -top-5 bg-card rounded-full p-1 border border-warning/50" />
            <h3 className="font-bold text-foreground text-lg">
              {MOCK_LEADERBOARD[0].name}
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              {MOCK_LEADERBOARD[0].team}
            </p>
            <Badge className="font-mono bg-warning hover:bg-warning/90 text-white px-3 py-1 text-sm">
              {MOCK_LEADERBOARD[0].points} pts
            </Badge>
          </div>
        </div>

        {/* Rank 3 */}
        <div className="flex flex-col items-center order-3 md:order-3 w-full md:w-1/3 max-w-[200px]">
          <Avatar className="w-16 h-16 border-4 border-chart-4/50 shadow-lg mb-4">
            <AvatarFallback className="bg-chart-4/20 text-chart-4 text-lg font-bold">
              {MOCK_LEADERBOARD[2].avatar}
            </AvatarFallback>
          </Avatar>
          <div className="bg-gradient-to-t from-chart-4/30 to-chart-4/10 w-full rounded-t-xl border border-chart-4/50 p-4 text-center flex flex-col items-center justify-end h-[120px] shadow-sm relative">
            <Medal className="w-8 h-8 text-chart-4 absolute -top-4 bg-card rounded-full p-1 border border-chart-4/30" />
            <h3 className="font-bold text-foreground">
              {MOCK_LEADERBOARD[2].name}
            </h3>
            <p className="text-xs text-muted-foreground mb-2">
              {MOCK_LEADERBOARD[2].team}
            </p>
            <Badge
              variant="secondary"
              className="font-mono bg-chart-4/10 text-chart-4 hover:bg-chart-4/20"
            >
              {MOCK_LEADERBOARD[2].points} pts
            </Badge>
          </div>
        </div>
      </div>

      <Card className="border-border/50 bg-card overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search interns or teams..."
              className="pl-9 bg-background w-full"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Live updates{" "}
            <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse ml-1" />
          </div>
        </div>
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[80px] text-center">Rank</TableHead>
              <TableHead>Intern</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-center">Streak</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_LEADERBOARD.slice(3).map((intern) => (
              <TableRow
                key={intern.rank}
                className={
                  intern.name === "Alex Doe"
                    ? "bg-primary/5"
                    : "hover:bg-muted/20"
                }
              >
                <TableCell className="text-center font-bold text-muted-foreground">
                  {intern.rank}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {intern.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">
                      {intern.name}
                    </span>
                    {intern.name === "Alex Doe" && (
                      <Badge
                        variant="outline"
                        className="ml-2 bg-primary/10 text-primary border-primary/20 text-[10px] uppercase"
                      >
                        You
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {intern.team}
                </TableCell>
                <TableCell className="text-center">
                  <div className="inline-flex items-center gap-1 font-mono text-sm">
                    {intern.streak > 0 ? (
                      <span className="text-warning font-medium flex items-center gap-1">
                        <Flame className="w-3 h-3" /> {intern.streak}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {intern.streak}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono font-medium text-foreground">
                  {intern.points.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
