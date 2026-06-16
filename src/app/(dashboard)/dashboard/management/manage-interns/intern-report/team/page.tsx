"use client";

import { ArrowLeft, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Table, { type Data } from "@/components/dashboard/table/Table";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Spinner } from "@/components/ui/spinner";
import { useManageWeeklyReviews } from "@/features/intern";
import { formatTasksCompleted } from "@/features/intern/utils/intern-helpers";

export default function TeamReportPage() {
  const searchParams = useSearchParams();
  const teamName = searchParams.get("team") || "";

  const { data: reviewsResponse, isLoading } = useManageWeeklyReviews({
    page: 1,
    perPage: 200, // retrieve a large chunk to filter
  });

  const allReviews = reviewsResponse?.data || [];
  const teamReviews = allReviews.filter(
    (r) => r.team?.toLowerCase() === teamName.toLowerCase(),
  );

  // Compute metrics
  const totalHours = teamReviews.reduce(
    (acc, curr) => acc + (curr.hours_committed || 0),
    0,
  );
  const totalSubmissions = teamReviews.length;
  const leavesCount = teamReviews.filter((r) => r.is_on_leave).length;
  const uniqueInterns = Array.from(
    new Set(teamReviews.map((r) => r.muid)),
  ).length;

  const tableColumns = [
    {
      column: "user_name",
      Label: "Hero Name",
      isSortable: true,
      wrap: (data: string, _id: string, row: Data) => (
        <div className="flex flex-col">
          <span className="font-bold uppercase text-[11px] tracking-tight">
            {String(data || (row as any).full_name || "Unknown")}
          </span>
          <span className="text-[9px] text-muted-foreground font-bold leading-none mt-1">
            {(row as any).muid || ""}
          </span>
        </div>
      ),
    },
    {
      column: "iso_week",
      Label: "Epoch",
      isSortable: true,
      wrap: (_data: string, _id: string, row: Data) => (
        <span className="font-bold text-[10px]">
          W{row.iso_week} {row.iso_year}
        </span>
      ),
    },
    {
      column: "hours_committed",
      Label: "Energy Committed",
      isSortable: true,
      wrap: (data: string) => (
        <span className="font-black text-brand-blue">{data} hrs</span>
      ),
    },
    {
      column: "tasks_completed",
      Label: "Conquests",
      isSortable: false,
      wrap: (data: any) => (
        <MarkdownRenderer
          content={formatTasksCompleted(data)}
          className="text-[11px] leading-relaxed"
        />
      ),
    },
    {
      column: "status",
      Label: "Status",
      isSortable: true,
      wrap: (data: string) => {
        switch (data) {
          case "APPROVED":
            return (
              <Badge
                variant="outline"
                className="border-success/30 text-success bg-success/10 text-[9px] uppercase tracking-wider font-black"
              >
                Approved
              </Badge>
            );
          case "REJECTED":
            return (
              <Badge
                variant="outline"
                className="border-destructive/30 text-destructive bg-destructive/10 text-[9px] uppercase tracking-wider font-black"
              >
                Rejected
              </Badge>
            );
          default:
            return (
              <Badge
                variant="outline"
                className="border-warning/30 text-warning bg-warning/10 text-[9px] uppercase tracking-wider font-black"
              >
                Pending
              </Badge>
            );
        }
      },
    },
  ];

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-5xl mx-auto w-full bg-background/50">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/management/manage-interns/intern-report">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <Badge
            variant="outline"
            className="font-black text-[10px] uppercase tracking-widest"
          >
            Team Scroll
          </Badge>
          <h2 className="text-3xl font-black tracking-tighter text-foreground uppercase mt-1">
            Team Report: {teamName}
          </h2>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Spinner className="w-8 h-8 text-primary" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-6 sm:grid-cols-4">
            <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-lg">
              <CardHeader className="pb-2">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Total Energy
                </span>
                <CardTitle className="text-2xl font-black text-brand-blue mt-1">
                  {totalHours} hrs
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[10px] font-bold text-muted-foreground uppercase">
                Collective Hours
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-lg">
              <CardHeader className="pb-2">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Team Members
                </span>
                <CardTitle className="text-2xl font-black text-foreground mt-1">
                  {uniqueInterns}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[10px] font-bold text-muted-foreground uppercase">
                Active Contributors
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-lg">
              <CardHeader className="pb-2">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Chronicles
                </span>
                <CardTitle className="text-2xl font-black text-brand-purple mt-1">
                  {totalSubmissions}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[10px] font-bold text-muted-foreground uppercase">
                Reviews Submitted
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-lg">
              <CardHeader className="pb-2">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Leaves Count
                </span>
                <CardTitle className="text-2xl font-black text-warning mt-1">
                  {leavesCount}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[10px] font-bold text-muted-foreground uppercase">
                Total Leaves Taken
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card className="border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden">
            <CardHeader className="py-6 border-b border-border/20">
              <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                Chronicle Archives
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table
                rows={teamReviews as unknown as Data[]}
                isloading={isLoading}
                page={1}
                perPage={200}
                columnOrder={tableColumns}
                id={["id"]}
                slNoCellClassName="font-black text-muted-foreground/20 w-16"
              >
                <THead
                  columnOrder={tableColumns}
                  onIconClick={() => {}}
                  action={false}
                  thClassName="bg-muted/20 border-b border-border/20 h-12 font-black uppercase text-[9px] tracking-[0.3em]"
                />
                {null}
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/20 py-8">
        <Sparkles className="w-3 h-3" /> Data Sanctum{" "}
        <Sparkles className="w-3 h-3" />
      </div>
    </div>
  );
}
