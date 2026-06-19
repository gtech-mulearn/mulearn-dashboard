"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Search,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useManageWeeklyReviews,
  useReviewWeeklyReview,
} from "@/features/intern";
import type { TWeeklyReview } from "@/features/intern/types";
import { formatTasksCompleted } from "@/features/intern/utils/intern-helpers";

export function InternReportPageClient() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [perPage] = useState(10);
  const [page, setPage] = useState(1);
  const [teamFilter, setTeamFilter] = useState("ALL");

  // Dialog states
  const [individualMuid, setIndividualMuid] = useState("");
  const [teamName, setTeamName] = useState("");

  // Review states
  const [selectedReview, setSelectedReview] = useState<TWeeklyReview | null>(
    null,
  );
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState("");

  // Queries & Mutations
  const { data: listData, isLoading } = useManageWeeklyReviews({
    page,
    perPage,
    search: searchText || undefined,
  });

  const reviewMutation = useReviewWeeklyReview(selectedReview?.id || "");

  const totalPages = listData?.pagination?.totalPages ?? 1;
  const totalCount = listData?.pagination?.count ?? 0;

  const rows = (listData?.data ?? []) as unknown as Data[];
  const filteredData = rows.filter((r) => {
    return teamFilter === "ALL" || r.team === teamFilter;
  });

  const uniqueTeams = Array.from(
    new Set((listData?.data || []).map((r) => r.team).filter(Boolean)),
  );

  const handleGenerateIndividual = () => {
    if (!individualMuid) return;
    router.push(
      `/dashboard/management/manage-interns/intern-report/individual?muid=${individualMuid}`,
    );
  };

  const handleGenerateTeam = () => {
    if (!teamName) return;
    router.push(
      `/dashboard/management/manage-interns/intern-report/team?team=${teamName}`,
    );
  };

  const columnOrder = [
    {
      column: "user_name",
      Label: "Hero Name",
      isSortable: true,
      wrap: (data: string, _id: string, row: Data) => (
        <span className="font-bold uppercase text-[11px] tracking-tight">
          {String(data || row.full_name || "Unknown")}
        </span>
      ),
    },
    {
      column: "muid",
      Label: "MUID Token",
      isSortable: true,
      wrap: (data: string) => (
        <Badge variant="outline" className="text-[10px]">
          {String(data)}
        </Badge>
      ),
    },
    {
      column: "team",
      Label: "Team",
      isSortable: true,
      wrap: (data: string) => (
        <Badge
          variant="outline"
          className="text-[9px] uppercase font-black tracking-widest"
        >
          {String(data)}
        </Badge>
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
      column: "tasks_completed",
      Label: "Achievements",
      isSortable: false,
      wrap: (data: any) => (
        <MarkdownRenderer
          content={formatTasksCompleted(data)}
          className="text-[11px] leading-relaxed"
        />
      ),
    },
    {
      column: "hours_committed",
      Label: "Energy",
      isSortable: true,
      wrap: (data: string) => (
        <div className="flex items-center gap-1 font-black text-brand-blue">
          {String(data)} <span className="text-[8px] opacity-50">HRS</span>
        </div>
      ),
    },
    {
      column: "status",
      Label: "Evaluation",
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
              <Button
                variant="default"
                className="w-full sm:w-auto font-black uppercase text-[10px] tracking-widest h-12 px-6"
              >
                Individual Scroll
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card/95 backdrop-blur-xl border-border/60">
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
                    className="h-12 font-bold rounded-md"
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
                  variant="default"
                  className="font-black uppercase text-[10px] tracking-widest"
                >
                  Summon Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="trusty"
                className="w-full sm:w-auto font-black uppercase text-[10px] tracking-widest h-12 px-6"
              >
                Team Scroll
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card/95 backdrop-blur-xl border-border/60">
              <DialogHeader>
                <DialogTitle className="font-black uppercase tracking-widest">
                  Team Report
                </DialogTitle>
              </DialogHeader>
              <div className="py-6 space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="team"
                    className="text-[10px] font-black uppercase tracking-widest opacity-60"
                  >
                    Enter Team Name
                  </Label>
                  <Input
                    id="team"
                    placeholder="e.g. Frontend"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="h-12 font-bold rounded-md"
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
                  variant="trusty"
                  className="font-black uppercase text-[10px] tracking-widest"
                >
                  Summon Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
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
                className="pl-12 h-14 bg-card/40 border-border/40 font-bold focus:ring-primary/20 w-full max-w-xl text-lg rounded-md"
              />
            </div>
          </div>

          <div className="w-full lg:w-72">
            <Label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              Team Filter
            </Label>
            <Select
              value={teamFilter}
              onValueChange={(v) => {
                setTeamFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-14 bg-card/40 border-border/40 font-black uppercase text-[10px] tracking-widest rounded-md">
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent className="bg-card font-bold border-border/60">
                <SelectItem value="ALL" className="uppercase text-[10px]">
                  All Teams
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

        <Table
          rows={filteredData}
          isLoading={isLoading}
          page={page}
          perPage={perPage}
          columnOrder={columnOrder}
          id={["id"]}
          slNoCellClassName="font-black text-muted-foreground/40 w-16"
          customActionRender={(row) => (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSelectedReview(row as unknown as TWeeklyReview);
                setReviewNote((row.review_note as string) ?? "");
                setIsReviewOpen(true);
              }}
              className="uppercase tracking-widest text-[9px] font-black text-primary hover:bg-muted/50 border border-border/20 px-2.5 h-7.5"
            >
              Evaluate
            </Button>
          )}
        >
          <THead
            columnOrder={columnOrder}
            onIconClick={() => {}}
            action={true}
            thClassName="bg-muted/20 border-b border-border/20 h-14 font-black uppercase text-[9px] tracking-[0.3em]"
          />
          <div className="p-4 border-t border-border/20">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              perPage={perPage}
              totalCount={totalCount}
              handlePreviousClick={() => setPage((p) => Math.max(1, p - 1))}
              handleNextClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
            />
          </div>
        </Table>
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/20 py-8">
        <Sparkles className="w-3 h-3" /> Data Sanctum{" "}
        <Sparkles className="w-3 h-3" />
      </div>

      {/* Weekly Review Evaluation Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-border/60">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-wider text-foreground">
              Evaluate Weekly Review
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review accomplishments and submit approval/rejection.
            </DialogDescription>
          </DialogHeader>

          {selectedReview &&
            (() => {
              const muid = selectedReview.muid || "";
              return (
                <div className="space-y-4 py-2 my-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Intern
                      </span>
                      <span className="font-bold text-foreground text-sm">
                        {selectedReview.user_name ||
                          (selectedReview as any).full_name ||
                          "Unknown"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        MUID
                      </span>
                      <span className="font-bold text-foreground text-sm">
                        {muid || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Hours Committed
                      </span>
                      <span className="font-bold text-foreground text-sm">
                        {selectedReview.hours_committed} Hour
                        {selectedReview.hours_committed !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        On Leave
                      </span>
                      <span className="font-bold text-foreground text-sm">
                        {selectedReview.is_on_leave
                          ? `Yes (${selectedReview.leave_days} day${(selectedReview.leave_days ?? 0) > 1 ? "s" : ""})`
                          : "No"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Status
                      </span>
                      <div className="mt-1">
                        {selectedReview.status === "APPROVED" && (
                          <Badge
                            variant="outline"
                            className="gap-1.5 text-success border-success/30 font-bold uppercase text-xs"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </Badge>
                        )}
                        {selectedReview.status === "REJECTED" && (
                          <Badge
                            variant="outline"
                            className="gap-1.5 text-destructive border-destructive/30 font-bold uppercase text-xs"
                          >
                            <XCircle className="w-3 h-3" /> Rejected
                          </Badge>
                        )}
                        {selectedReview.status === "PENDING" && (
                          <Badge
                            variant="outline"
                            className="gap-1.5 text-warning border-warning/30 font-bold uppercase text-xs"
                          >
                            <AlertTriangle className="w-3 h-3" /> Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Team / Week
                      </span>
                      <span className="font-bold text-foreground text-sm">
                        {selectedReview.team} - W{selectedReview.iso_week}{" "}
                        {selectedReview.iso_year}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Tasks Completed (Achievements)
                    </span>
                    {selectedReview.tasks_completed ? (
                      <div className="bg-muted/40 p-2.5 rounded-lg border border-border/20 max-h-40 overflow-y-auto leading-relaxed mt-1">
                        <MarkdownRenderer
                          content={formatTasksCompleted(
                            selectedReview.tasks_completed,
                          )}
                          className="text-xs"
                        />
                      </div>
                    ) : (
                      <p className="text-xs italic text-muted-foreground mt-1">
                        None reported.
                      </p>
                    )}
                  </div>

                  {selectedReview.blockers && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Blockers
                      </span>
                      <p className="bg-destructive/5 text-destructive p-2.5 rounded-lg text-xs font-semibold border border-destructive/20 leading-relaxed">
                        {selectedReview.blockers}
                      </p>
                    </div>
                  )}

                  {selectedReview.suggestions && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Suggestions
                      </span>
                      <p className="bg-muted/40 p-2.5 rounded-lg text-xs font-semibold border border-border/20 leading-relaxed text-foreground/80">
                        {selectedReview.suggestions}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t border-border/20 flex flex-col gap-1">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      Evaluation Notes / Feedback
                    </Label>
                    <textarea
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder="Feedback visible to the intern..."
                      className="w-full min-h-[80px] bg-background/50 border border-border/40 rounded-lg p-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
                    />
                  </div>
                </div>
              );
            })()}

          <DialogFooter className="gap-2 sm:justify-between border-t border-border/20 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsReviewOpen(false)}
              className="gap-2 text-[10px] tracking-widest h-10 shadow-lg"
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => {
                  if (!selectedReview) return;
                  reviewMutation.mutate(
                    { action: "reject", review_note: reviewNote },
                    {
                      onSuccess: () => {
                        setIsReviewOpen(false);
                        setReviewNote("");
                        setSelectedReview(null);
                      },
                    },
                  );
                }}
                disabled={reviewMutation.isPending}
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive hover:text-white hover:border-destructive hover:bg-none gap-2 text-[10px] tracking-widest h-10 shadow-lg font-bold"
              >
                Reject
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (!selectedReview) return;
                  reviewMutation.mutate(
                    { action: "approve", review_note: reviewNote },
                    {
                      onSuccess: () => {
                        setIsReviewOpen(false);
                        setReviewNote("");
                        setSelectedReview(null);
                      },
                    },
                  );
                }}
                disabled={reviewMutation.isPending}
                variant="outline"
                className="border-success text-success hover:bg-success hover:text-white hover:border-success hover:bg-none gap-2 text-[10px] tracking-widest h-10 shadow-lg font-bold"
              >
                Approve
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
