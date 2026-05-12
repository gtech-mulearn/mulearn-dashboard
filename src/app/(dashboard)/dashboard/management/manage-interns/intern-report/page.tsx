"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import Table from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    { column: "full_name", Label: "Name", isSortable: true },
    { column: "muid", Label: "MUID", isSortable: true },
    { column: "team", Label: "Team", isSortable: true },
    { column: "week", Label: "Week", isSortable: true },
    { column: "tasks_completed", Label: "Tasks Completed", isSortable: false },
    { column: "hours_committed", Label: "Hours Committed", isSortable: true },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-start lg:items-center justify-between gap-6">
          <div>
            <CardTitle className="text-2xl font-semibold">
              Weekly Report Generator
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              Generate weekly reports for interns and team Performance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  Generate Individual Report
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Individual Report</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="muid">Intern MUID</Label>
                    <Input
                      id="muid"
                      placeholder="e.g. dev-1234"
                      value={individualMuid}
                      onChange={(e) => setIndividualMuid(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    onClick={handleGenerateIndividual}
                    disabled={!individualMuid}
                  >
                    Generate
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  Generate Team Report
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Team Report</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="team">Team Name</Label>
                    <Input
                      id="team"
                      placeholder="e.g. Frontend"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleGenerateTeam} disabled={!teamName}>
                    Generate
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <TableTop
                onSearchText={(t) => {
                  setSearchText(t);
                  setPage(1);
                }}
                onPerPageNumber={(n) => {
                  setPerPage(n);
                  setPage(1);
                }}
                CSV=""
                perPage={perPage}
                perPageOptions={[10, 20, 50]}
                searchPlaceholder="Search by Name or MUID..."
                searchSize="md"
                searchPosition="left"
              />
            </div>

            <div className="w-full md:w-64 mb-4">
              <Label className="mb-2 block text-sm font-medium text-muted-foreground">
                Filter by Team
              </Label>
              <Select
                value={teamFilter}
                onValueChange={(v) => {
                  setTeamFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Teams</SelectItem>
                  {uniqueTeams.map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table
            rows={currentRows as any}
            isloading={isLoading}
            page={page}
            perPage={perPage}
            columnOrder={columnOrder}
          >
            <THead
              columnOrder={columnOrder}
              onIconClick={() => {}}
              action={false}
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
    </div>
  );
}
