"use client";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Flame,
  Gem,
  MoreHorizontal,
  PauseCircle,
  Shield,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { ReactElement } from "react";
import { useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock Data for Admin Overview
const MOCK_STATS = {
  totalInterns: 142,
  active: 118,
  atRisk: 15,
  onLeave: 5,
  inactive: 4,
  totalPointsAwarded: 125400,
};

const MOCK_INTERNS = [
  {
    id: "int_01",
    name: "Alex Doe",
    email: "alex.doe@example.com",
    team: "Frontend Guild",
    status: "ACTIVE",
    streak: 14,
    points: 1240,
    rank: 3,
  },
  {
    id: "int_02",
    name: "Sarah Smith",
    email: "sarah.s@example.com",
    team: "Backend Guild",
    status: "AT_RISK",
    streak: 0,
    points: 850,
    rank: 42,
  },
  {
    id: "int_03",
    name: "Michael Chen",
    email: "m.chen@example.com",
    team: "Design Guild",
    status: "ACTIVE",
    streak: 28,
    points: 2100,
    rank: 1,
  },
  {
    id: "int_04",
    name: "Emma Wilson",
    email: "emma.w@example.com",
    team: "Frontend Guild",
    status: "ON_LEAVE",
    streak: 0,
    points: 920,
    rank: 35,
  },
  {
    id: "int_05",
    name: "David Kim",
    email: "dkim@example.com",
    team: "Mobile Guild",
    status: "INACTIVE",
    streak: 0,
    points: 120,
    rank: 112,
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge
          variant="outline"
          className="border-success/30 text-success bg-success/10 gap-1.5"
        >
          <CheckCircle2 className="w-3 h-3" /> Active
        </Badge>
      );
    case "AT_RISK":
      return (
        <Badge
          variant="outline"
          className="border-warning/30 text-warning bg-warning/10 gap-1.5"
        >
          <AlertTriangle className="w-3 h-3" /> At Risk
        </Badge>
      );
    case "ON_LEAVE":
      return (
        <Badge
          variant="outline"
          className="border-brand-blue/30 text-brand-blue bg-brand-blue/10 gap-1.5"
        >
          <PauseCircle className="w-3 h-3" /> On Leave
        </Badge>
      );
    case "INACTIVE":
      return (
        <Badge
          variant="outline"
          className="border-muted-foreground/30 text-muted-foreground bg-muted/50 gap-1.5"
        >
          <Shield className="w-3 h-3" /> Inactive
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function ManageInternsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [_searchText, setSearchText] = useState("");

  const tableColumns = [
    {
      column: "name",
      Label: "Intern Name",
      isSortable: true,
      wrap: (data: string | ReactElement, _id: string, row: Data) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground uppercase tracking-tight text-sm">
            {data}
          </span>
          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mt-1">
            {row.email as string}
          </span>
        </div>
      ),
    },
    {
      column: "team",
      Label: "Alliance",
      isSortable: true,
      wrap: (data: string | ReactElement) => (
        <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
          {data}
        </span>
      ),
    },
    {
      column: "status",
      Label: "Status",
      isSortable: true,
      wrap: (data: string | ReactElement) => getStatusBadge(data as string),
    },
    {
      column: "streak",
      Label: "Streak",
      isSortable: true,
      wrap: (data: string | ReactElement) => (
        <div className="font-mono font-black text-warning flex items-center gap-1">
          {Number(data) > 0 ? (
            <>
              <Flame className="w-3 h-3 fill-warning" /> {data}
            </>
          ) : (
            <span className="text-muted-foreground/40">{data}</span>
          )}
        </div>
      ),
    },
    {
      column: "points",
      Label: "Gems",
      isSortable: true,
      wrap: (data: string | ReactElement) => (
        <div className="font-mono font-black text-foreground flex items-center gap-1.5">
          <Gem className="w-3.5 h-3.5 text-brand-blue" />
          {Number(data).toLocaleString()}
        </div>
      ),
    },
    {
      column: "rank",
      Label: "Rank",
      isSortable: true,
      wrap: (data: string | ReactElement) => (
        <span className="font-black text-muted-foreground">#{data}</span>
      ),
    },
  ];

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto w-full bg-background/50">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase flex items-center gap-3">
            <Users className="w-10 h-10 text-primary" />
            Manage Interns
          </h2>
          <p className="text-muted-foreground mt-1 font-medium italic">
            Oversee the realm of active learners and contributors.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/management/manage-interns/intern-report">
            <Button className="gap-2 bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest h-10 shadow-lg">
              <Sparkles className="w-4 h-4" />
              Generate Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl border-t-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Total Interns
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter tabular-nums">
              {MOCK_STATS.totalInterns}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-tight">
              +12 this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl border-t-success/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Active Heroes
            </CardTitle>
            <Activity className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter tabular-nums text-success">
              {MOCK_STATS.active}
            </div>
            <p className="text-[10px] text-success font-bold mt-2 uppercase tracking-tight">
              83% engagement rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl border-t-warning/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Failing Quests
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter tabular-nums text-warning">
              {MOCK_STATS.atRisk}
            </div>
            <p className="text-[10px] text-warning font-bold mt-2 uppercase tracking-tight">
              Missed &gt; 3 timesheets
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl border-t-brand-blue/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Global XP Bank
            </CardTitle>
            <Trophy className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-mono tracking-tighter tabular-nums text-brand-blue flex items-center gap-2">
              <Gem className="w-6 h-6" />
              {MOCK_STATS.totalPointsAwarded.toLocaleString()}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-tight">
              Across all cohorts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interns Data Table Section */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black uppercase tracking-widest">
              Intern Directory
            </h3>
            <p className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-wider">
              Manage profiles and track progress
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px] h-10 font-black uppercase text-[10px] tracking-widest border-border/40">
                <SelectValue placeholder="Alliance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="all"
                  className="font-bold uppercase text-[10px]"
                >
                  All Alliances
                </SelectItem>
                <SelectItem
                  value="frontend"
                  className="font-bold uppercase text-[10px]"
                >
                  Frontend
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TableTop
          onSearchText={setSearchText}
          onPerPageNumber={setPerPage}
          CSV="interns.csv"
          perPage={perPage}
          perPageOptions={[10, 20, 50]}
          searchPlaceholder="Search heroes..."
          searchSize="md"
          searchPosition="left"
          searchWrapperClassName="bg-card/40 border-border/40"
        />

        <Card className="border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardContent className="p-0">
            <Table
              rows={MOCK_INTERNS}
              page={page}
              perPage={perPage}
              columnOrder={tableColumns}
              id={["id"]}
              slNoCellClassName="font-black text-muted-foreground/40 w-16"
              customActionRender={(_row) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-muted/50"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 bg-card/95 backdrop-blur-xl border-border/60 font-bold"
                  >
                    <DropdownMenuItem className="cursor-pointer uppercase text-[10px] tracking-wider py-3">
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer uppercase text-[10px] tracking-wider py-3">
                      Adjust XP
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            />

            <div className="p-4 border-t border-border/20">
              <Pagination
                currentPage={page}
                totalPages={Math.ceil(MOCK_INTERNS.length / perPage)}
                perPage={perPage}
                totalCount={MOCK_INTERNS.length}
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
