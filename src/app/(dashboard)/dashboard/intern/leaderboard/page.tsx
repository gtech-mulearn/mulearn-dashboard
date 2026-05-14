"use client";

import { Clock, Gem, Trophy } from "lucide-react";
import { useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Table from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import Pagination from "@/components/dashboard/table/pagination";

export default function LeaderboardPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");

  const MOCK_LEADERBOARD = [
    {
      id: "1",
      rank: 1,
      name: "Michael Chen",
      team: "Design",
      points: 2100,
      streak: 28,
      avatar: "MC",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    },
    {
      id: "2",
      rank: 2,
      name: "Jessica Wong",
      team: "Backend",
      points: 1950,
      streak: 15,
      avatar: "JW",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
    },
    {
      id: "3",
      rank: 3,
      name: "Alex Doe",
      team: "Frontend",
      points: 1240,
      streak: 14,
      avatar: "AD",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    },
    {
      id: "4",
      rank: 4,
      name: "Emma Wilson",
      team: "Frontend",
      points: 920,
      streak: 5,
      avatar: "EW",
    },
    {
      id: "5",
      rank: 5,
      name: "Sarah Smith",
      team: "Backend",
      points: 850,
      streak: 0,
      avatar: "SS",
    },
    {
      id: "6",
      rank: 6,
      name: "David Kim",
      team: "Mobile",
      points: 810,
      streak: 2,
      avatar: "DK",
    },
    {
      id: "7",
      rank: 7,
      name: "Lisa Brown",
      team: "Design",
      points: 790,
      streak: 4,
      avatar: "LB",
    },
  ];

  const tableColumns = [
    {
      column: "name",
      Label: "Username",
      isSortable: false,
      wrap: (data: any, id: string, row: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={row.avatarUrl} />
            <AvatarFallback className="text-xs">{row.avatar}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{data}</span>
          {row.name === "Alex Doe" && (
            <Badge className="bg-brand-blue/10 text-brand-blue border-brand-blue/20 text-[10px] h-4">
              YOU
            </Badge>
          )}
        </div>
      ),
    },
    {
      column: "points",
      Label: "Points",
      isSortable: true,
      wrap: (data: any) => (
        <div className="flex items-center gap-1.5 font-mono">
          <Gem className="w-3.5 h-3.5 text-brand-blue" />
          {data}
        </div>
      ),
    },
    {
      column: "streak",
      Label: "Streak",
      isSortable: true,
      wrap: (data: any) => (
        <div className="flex items-center gap-1.5 text-warning">
          <span>🔥</span>
          {data}
        </div>
      ),
    },
  ];

  const top3 = MOCK_LEADERBOARD.slice(0, 3);
  const others = MOCK_LEADERBOARD.slice(3);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto w-full bg-background/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Trophy className="w-8 h-8 text-warning" />
            Reward Leaderboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Compete with others and earn rewards.
          </p>
        </div>
        <Tabs defaultValue="daily" className="w-full sm:w-auto">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="daily" className="px-6">
              Daily
            </TabsTrigger>
            <TabsTrigger value="monthly" className="px-6">
              Monthly
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Podium Section */}
      <div className="relative flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 pt-20 pb-12">
        {/* Rank 2 */}
        <div className="flex flex-col items-center w-full md:w-64 z-10">
          <div className="relative mb-4">
            <Avatar className="w-24 h-24 border-4 border-slate-400 shadow-[0_0_20px_rgba(148,163,184,0.3)]">
              <AvatarImage src={top3[1].avatarUrl} />
              <AvatarFallback className="bg-slate-800 text-slate-200 text-xl font-bold">
                {top3[1].avatar}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-2 -right-2 bg-slate-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-background">
              2
            </div>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">
            {top3[1].name}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">Earn 500 points</p>
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-6 w-full text-center shadow-xl flex flex-col items-center gap-3 h-48 justify-end transform transition-transform hover:scale-105">
            <div className="p-2 bg-slate-400/10 rounded-lg">
              <Trophy className="w-6 h-6 text-slate-400" />
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Reward
              </p>
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-foreground">
                <Gem className="w-6 h-6 text-brand-blue" />
                5,000
              </div>
              <p className="text-xs text-muted-foreground">Prize</p>
            </div>
          </div>
        </div>

        {/* Rank 1 */}
        <div className="flex flex-col items-center w-full md:w-72 z-20 -mt-8 md:-mt-12">
          <div className="relative mb-6">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-4xl animate-bounce">
              👑
            </div>
            <Avatar className="w-32 h-32 border-4 border-warning shadow-[0_0_30px_rgba(255,141,12,0.4)] ring-4 ring-warning/20">
              <AvatarImage src={top3[0].avatarUrl} />
              <AvatarFallback className="bg-warning/20 text-warning text-2xl font-bold">
                {top3[0].avatar}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-2 -right-2 bg-warning text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 border-background shadow-lg">
              1
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-foreground mb-1">
            {top3[0].name}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">Earn 1500 points</p>
          <div className="bg-gradient-to-b from-card to-warning/5 backdrop-blur-sm border-2 border-warning/30 rounded-2xl p-8 w-full text-center shadow-[0_20px_50px_rgba(255,141,12,0.15)] flex flex-col items-center gap-4 h-64 justify-end relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-warning to-transparent opacity-50" />
            <div className="p-3 bg-warning/10 rounded-xl group-hover:scale-110 transition-transform">
              <Trophy className="w-8 h-8 text-warning" />
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-warning font-bold">
                Grand Prize
              </p>
              <div className="flex items-center justify-center gap-2 text-4xl font-black text-foreground tabular-nums">
                <Gem className="w-8 h-8 text-brand-blue" />
                10,000
              </div>
              <p className="text-sm text-muted-foreground">Prize Points</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 bg-muted/30 px-3 py-1.5 rounded-full">
              <Clock className="w-3 h-3" />
              Ends In: 00d 00h 43m 51s
            </div>
          </div>
        </div>

        {/* Rank 3 */}
        <div className="flex flex-col items-center w-full md:w-64 z-10">
          <div className="relative mb-4">
            <Avatar className="w-24 h-24 border-4 border-amber-700/50 shadow-[0_0_20px_rgba(180,83,9,0.2)]">
              <AvatarImage src={top3[2].avatarUrl} />
              <AvatarFallback className="bg-amber-900/20 text-amber-700 text-xl font-bold">
                {top3[2].avatar}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-2 -right-2 bg-amber-700/80 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-background">
              3
            </div>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">
            {top3[2].name}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">Earn 250 points</p>
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-6 w-full text-center shadow-xl flex flex-col items-center gap-3 h-44 justify-end transform transition-transform hover:scale-105">
            <div className="p-2 bg-amber-700/10 rounded-lg">
              <Trophy className="w-6 h-6 text-amber-700" />
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Reward
              </p>
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-foreground">
                <Gem className="w-6 h-6 text-brand-blue" />
                2,500
              </div>
              <p className="text-xs text-muted-foreground">Prize</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Status Banner */}
      <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-full py-3 px-8 text-center text-sm font-medium text-brand-blue max-w-2xl mx-auto flex items-center justify-center gap-2 mb-12 animate-pulse">
        You earned <Gem className="w-4 h-4" /> 50 today and are ranked - out of{" "}
        <span className="font-bold">13868</span> users
      </div>

      {/* Rankings Table */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Rankings</h3>

        <TableTop
          onSearchText={setSearchText}
          onPerPageNumber={setPerPage}
          CSV=""
          perPage={perPage}
          perPageOptions={[10, 20, 50]}
          searchPlaceholder="Search users..."
          searchSize="md"
          searchPosition="left"
          searchWrapperClassName="bg-card/40 border-border/40"
        />

        <Card className="border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardContent className="p-0">
            <Table
              rows={others}
              page={page}
              perPage={perPage}
              columnOrder={tableColumns}
              id={["id"]}
              slNoCellClassName="text-muted-foreground font-bold"
            />
            <div className="p-4 border-t border-border/20">
              <Pagination
                currentPage={page}
                totalPages={Math.ceil(others.length / perPage)}
                perPage={perPage}
                totalCount={others.length}
                handlePreviousClick={() => setPage((p) => Math.max(1, p - 1))}
                handleNextClick={() => setPage((p) => p + 1)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
