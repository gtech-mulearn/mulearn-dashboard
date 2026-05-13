"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import Table from "@/components/dashboard/table/Table";
import THead from "@/components/dashboard/table/Thead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Trophy } from "lucide-react";

const MOCK_RESPONSES = [
  {
    id: "1",
    muid: "dev-1234",
    full_name: "Alex Doe",
    team: "Frontend",
    week: "W13 2026",
    tasks_completed: "Built dashboard UI",
    hours_committed: "40",
  },
  {
    id: "2",
    muid: "dev-5678",
    full_name: "Sarah Smith",
    team: "Backend",
    week: "W13 2026",
    tasks_completed: "API integration",
    hours_committed: "38",
  },
  {
    id: "3",
    muid: "dev-9012",
    full_name: "Michael Chen",
    team: "Design",
    week: "W13 2026",
    tasks_completed: "Figma prototypes",
    hours_committed: "45",
  },
];

export default function WeeklyReportGeneratorPage() {
  const router = useRouter();
  const responses = MOCK_RESPONSES;
  const isLoading = false;
  const [searchText, setSearchText] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [teamFilter, setTeamFilter] = useState("ALL");

  // Dialog states
  const [individualMuid, setIndividualMuid] = useState("");
  const [teamName, setTeamName] = useState("");

  const handleGenerateIndividual = () => {
    if (!individualMuid) return;
    router.push(
      `/dashboard/admin/weekly-report-generator/individual?muid=${individualMuid}`,
    );
  };

  const handleGenerateTeam = () => {
    if (!teamName) return;
    router.push(
      `/dashboard/admin/weekly-report-generator/team?team=${teamName}`,
    );
  };

  const filteredData = (responses || []).filter((r) => {
    const searchLower = searchText.toLowerCase();
    const matchesSearch =
      r.muid?.toLowerCase().includes(searchLower) ||
      r.full_name?.toLowerCase().includes(searchLower);

    const matchesTeam = teamFilter === "ALL" || r.team === teamFilter;

    return matchesSearch && matchesTeam;
  });

  const uniqueTeams = Array.from(
    new Set((responses || []).map((r) => r.team).filter(Boolean)),
  );

  const startIndex = (page - 1) * perPage;
  const currentRows = filteredData.slice(startIndex, startIndex + perPage);

  const columnOrder = [
    {
      column: "full_name",
      Label: "Hero Name",
      isSortable: true,
      wrap: (data: any) => (
        <span className="font-bold uppercase text-[11px] tracking-tight">
          {data}
        </span>
      ),
    },
    {
      column: "muid",
      Label: "MUID Token",
      isSortable: true,
      wrap: (data: any) => (
        <span className="font-mono text-[10px] bg-muted/50 px-2 py-0.5 rounded">
          {data}
        </span>
      ),
    },
    {
      column: "team",
      Label: "Alliance",
      isSortable: true,
      wrap: (data: any) => (
        <Badge
          variant="outline"
          className="text-[9px] uppercase font-black tracking-widest"
        >
          {data}
        </Badge>
      ),
    },
    { column: "week", Label: "Epoch", isSortable: true },
    {
      column: "tasks_completed",
      Label: "Achievements",
      isSortable: false,
      wrap: (data: any) => (
        <span className="text-xs italic text-muted-foreground">"{data}"</span>
      ),
    },
    {
      column: "hours_committed",
      Label: "Energy",
      isSortable: true,
      wrap: (data: any) => (
        <div className="flex items-center gap-1 font-black text-brand-blue">
          {data} <span className="text-[8px] opacity-50">XP</span>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 bg-background/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase flex items-center gap-3">
            <Trophy className="w-10 h-10 text-warning" />
            Report Generator
          </h2>
          <p className="text-muted-foreground mt-1 font-medium italic">
            Analyze the achievements and artifacts of the guild members.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-brand-blue hover:bg-brand-blue/90 font-black uppercase text-[10px] tracking-widest h-12 px-6 shadow-lg shadow-brand-blue/20">
                Individual Scroll
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border/60">
              <DialogHeader>
                <DialogTitle className="font-black uppercase tracking-widest">
                  Individual Report
                </DialogTitle>
              </DialogHeader>
              <div className="py-6 space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="muid"
                    className="text-[10px] font-black uppercase tracking-widest opacity-60"
                  >
                    Enter MUID Token
                  </Label>
                  <Input
                    id="muid"
                    placeholder="e.g. dev-1234"
                    value={individualMuid}
                    onChange={(e) => setIndividualMuid(e.target.value)}
                    className="h-12 font-bold"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="font-bold uppercase text-[10px]"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  onClick={handleGenerateIndividual}
                  disabled={!individualMuid}
                  className="bg-brand-blue font-black uppercase text-[10px] tracking-widest"
                >
                  Summon Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-brand-purple hover:bg-brand-purple/90 font-black uppercase text-[10px] tracking-widest h-12 px-6 shadow-lg shadow-brand-purple/20">
                Alliance Scroll
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border/60">
              <DialogHeader>
                <DialogTitle className="font-black uppercase tracking-widest">
                  Alliance Report
                </DialogTitle>
              </DialogHeader>
              <div className="py-6 space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="team"
                    className="text-[10px] font-black uppercase tracking-widest opacity-60"
                  >
                    Enter Alliance Name
                  </Label>
                  <Input
                    id="team"
                    placeholder="e.g. Frontend"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="h-12 font-bold"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="font-bold uppercase text-[10px]"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  onClick={handleGenerateTeam}
                  disabled={!teamName}
                  className="bg-brand-purple font-black uppercase text-[10px] tracking-widest"
                >
                  Summon Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/20 py-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="flex-1 space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <Input
                  placeholder="Search by Name or Token..."
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setPage(1);
                  }}
                  className="pl-12 h-14 bg-background/50 border-border/50 font-bold focus:ring-primary/20 w-full max-w-xl text-lg"
                />
              </div>
            </div>

            <div className="w-full lg:w-72">
              <Label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Alliance Filter
              </Label>
              <Select
                value={teamFilter}
                onValueChange={(v) => {
                  setTeamFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-14 bg-background/50 border-border/50 font-black uppercase text-[10px] tracking-widest">
                  <SelectValue placeholder="All Alliances" />
                </SelectTrigger>
                <SelectContent className="bg-card font-bold">
                  <SelectItem value="ALL" className="uppercase text-[10px]">
                    All Alliances
                  </SelectItem>
                  {uniqueTeams.map((team) => (
                    <SelectItem
                      key={team}
                      value={team}
                      className="uppercase text-[10px]"
                    >
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            rows={currentRows as any}
            isloading={isLoading}
            page={page}
            perPage={perPage}
            columnOrder={columnOrder}
            id={["id"]}
            slNoCellClassName="font-black text-muted-foreground/20 w-16"
          >
            <THead
              columnOrder={columnOrder}
              onIconClick={() => {}}
              action={false}
              thClassName="bg-muted/20 border-b border-border/20 h-14 font-black uppercase text-[9px] tracking-[0.3em]"
            />
            {filteredData.length > 0 && (
              <Pagination
                currentPage={page}
                totalPages={Math.ceil(filteredData.length / perPage)}
                perPage={perPage}
                totalCount={filteredData.length}
                handlePreviousClick={() => setPage((p) => Math.max(1, p - 1))}
                handleNextClick={() => setPage((p) => p + 1)}
              />
            )}
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/20 py-8">
        <Sparkles className="w-3 h-3" /> Data Sanctum{" "}
        <Sparkles className="w-3 h-3" />
      </div>
    </div>
  );
}
