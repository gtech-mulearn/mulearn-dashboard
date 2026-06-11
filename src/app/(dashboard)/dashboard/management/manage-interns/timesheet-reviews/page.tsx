"use client";

import { Search, Sparkles, Trophy } from "lucide-react";
import { useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  useManageTimesheets,
  useReviewTimesheet,
} from "@/features/intern/hooks/use-manage-interns";
import type { TTimesheet } from "@/features/intern/types";

export default function TimesheetReviewsPage() {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [perPage, _setPerPage] = useState(10);

  // Review states
  const [selectedTimesheet, setSelectedTimesheet] = useState<TTimesheet | null>(
    null,
  );
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState("");

  const { data: listData, isLoading } = useManageTimesheets({
    page,
    perPage,
    search: searchText || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const reviewMutation = useReviewTimesheet(selectedTimesheet?.id || "");

  const totalPages = listData?.pagination?.totalPages ?? 1;
  const totalCount = listData?.pagination?.count ?? 0;
  const rows = (listData?.data ?? []) as unknown as Data[];

  const columnOrder = [
    {
      column: "user_name",
      Label: "Intern Name",
      isSortable: true,
      wrap: (data: string, _id: string, row: Data) => (
        <div className="flex flex-col">
          <span className="font-bold uppercase text-[11px] tracking-tight">
            {String(data || (row as any).full_name || "Unknown")}
          </span>
          <span className="text-[9px] text-muted-foreground font-mono font-bold leading-none mt-1">
            {(row as any).muid || ""}
          </span>
        </div>
      ),
    },
    {
      column: "entry_date",
      Label: "Log Date",
      isSortable: true,
      wrap: (data: string) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {new Date(data).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      column: "category",
      Label: "Category",
      isSortable: true,
      wrap: (data: string) => (
        <Badge
          variant="outline"
          className="text-[9px] uppercase font-black tracking-widest bg-muted/40"
        >
          {String(data)}
        </Badge>
      ),
    },
    {
      column: "hours",
      Label: "Hours",
      isSortable: true,
      wrap: (data: string) => (
        <span className="font-mono font-black text-brand-blue">{data} hrs</span>
      ),
    },
    {
      column: "description",
      Label: "Description",
      isSortable: false,
      wrap: (data: string) => (
        <p
          className="text-xs text-muted-foreground max-w-xs truncate"
          title={data}
        >
          {data}
        </p>
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
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 bg-background/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase flex items-center gap-3">
            <Trophy className="w-10 h-10 text-brand-blue" />
            Timesheet Reviews
          </h2>
          <p className="text-muted-foreground mt-1 font-medium italic">
            Evaluate and verify daily quest entries submitted by interns.
          </p>
        </div>
      </div>

      <Card className="border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/20 py-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <Input
                  placeholder="Search by Name or MUID..."
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setPage(1);
                  }}
                  className="pl-12 h-12 bg-background/50 border-border/50 font-bold focus:ring-primary/20 w-full max-w-xl text-sm rounded-md"
                />
              </div>
            </div>

            <div className="w-full lg:w-64 flex gap-4">
              <div className="flex-1">
                <Label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  Status Filter
                </Label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-12 bg-background/50 border-border/50 font-black uppercase text-[10px] tracking-widest rounded-md">
                    <SelectValue placeholder="Pending" />
                  </SelectTrigger>
                  <SelectContent className="bg-card font-bold border-border/60">
                    <SelectItem value="ALL" className="uppercase text-[10px]">
                      All Logs
                    </SelectItem>
                    <SelectItem
                      value="PENDING"
                      className="uppercase text-[10px]"
                    >
                      Pending
                    </SelectItem>
                    <SelectItem
                      value="APPROVED"
                      className="uppercase text-[10px]"
                    >
                      Approved
                    </SelectItem>
                    <SelectItem
                      value="REJECTED"
                      className="uppercase text-[10px]"
                    >
                      Rejected
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            rows={rows}
            isloading={isLoading}
            page={page}
            perPage={perPage}
            columnOrder={columnOrder}
            id={["id"]}
            slNoCellClassName="font-black text-muted-foreground/20 w-16"
            customActionRender={(row) => (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedTimesheet(row as unknown as TTimesheet);
                  setReviewNote(row.review_note ? String(row.review_note) : "");
                  setIsReviewOpen(true);
                }}
                className="uppercase tracking-widest text-[9px] font-black text-primary hover:bg-muted/50 border border-border/20 px-2.5 h-7.5"
              >
                {row.status === "PENDING" ? "Evaluate" : "View"}
              </Button>
            )}
          >
            <THead
              columnOrder={columnOrder}
              onIconClick={() => {}}
              action={true}
              thClassName="bg-muted/20 border-b border-border/20 h-12 font-black uppercase text-[9px] tracking-[0.3em]"
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
        </CardContent>
      </Card>

      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-border/60">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-wider text-foreground">
              Evaluate Daily Timesheet
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review accomplishments and approve daily logs.
            </DialogDescription>
          </DialogHeader>

          {selectedTimesheet && (
            <div className="space-y-4 py-2 my-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                    Intern
                  </span>
                  <span className="font-bold text-foreground">
                    {(selectedTimesheet as any).user_name ||
                      (selectedTimesheet as any).full_name ||
                      "Unknown"}{" "}
                    ({(selectedTimesheet as any).muid})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                    Log Date
                  </span>
                  <span className="font-bold text-foreground">
                    {new Date(selectedTimesheet.entry_date).toLocaleDateString(
                      undefined,
                      {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                    Category
                  </span>
                  <Badge variant="outline" className="font-bold mt-1 text-xs">
                    {selectedTimesheet.category}
                  </Badge>
                </div>
                <div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                    Energy Expended
                  </span>
                  <span className="font-black text-brand-blue font-mono">
                    {selectedTimesheet.hours} Hours
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">
                  Log description
                </span>
                {selectedTimesheet.description ? (
                  <div className="bg-muted/40 p-2.5 rounded-lg border border-border/20 max-h-40 overflow-y-auto">
                    <MarkdownRenderer
                      content={selectedTimesheet.description}
                      className="text-xs"
                    />
                  </div>
                ) : (
                  <p className="text-xs italic text-muted-foreground">
                    No description provided.
                  </p>
                )}
              </div>

              {selectedTimesheet.blockers &&
                selectedTimesheet.blockers !== "None" && (
                  <div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Blockers
                    </span>
                    <p className="bg-destructive/5 text-destructive p-2 rounded-lg text-xs font-bold mt-1 border border-destructive/20">
                      {selectedTimesheet.blockers}
                    </p>
                  </div>
                )}

              {selectedTimesheet.status === "PENDING" ? (
                <div className="space-y-2 pt-2 border-t border-border/20">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Review Notes / Feedback
                  </Label>
                  <textarea
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Feedback visible to the intern..."
                    className="w-full min-h-[80px] bg-background/50 border border-border/40 rounded-lg p-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
                  />
                </div>
              ) : (
                selectedTimesheet.review_note && (
                  <div className="pt-2 border-t border-border/20">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Council Review Note
                    </span>
                    <p className="p-2 bg-muted/20 border rounded-lg text-xs mt-1 text-muted-foreground">
                      {selectedTimesheet.review_note}
                    </p>
                  </div>
                )
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-between border-t border-border/20 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsReviewOpen(false)}
              className="uppercase tracking-widest text-[10px] font-black border-border/50"
            >
              Close
            </Button>
            {selectedTimesheet?.status === "PENDING" && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    reviewMutation.mutate(
                      { action: "reject", review_note: reviewNote },
                      {
                        onSuccess: () => {
                          setIsReviewOpen(false);
                          setReviewNote("");
                          setSelectedTimesheet(null);
                        },
                      },
                    );
                  }}
                  disabled={reviewMutation.isPending}
                  variant="destructive"
                  className="uppercase tracking-widest text-[10px] font-black"
                >
                  Reject
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    reviewMutation.mutate(
                      { action: "approve", review_note: reviewNote },
                      {
                        onSuccess: () => {
                          setIsReviewOpen(false);
                          setReviewNote("");
                          setSelectedTimesheet(null);
                        },
                      },
                    );
                  }}
                  disabled={reviewMutation.isPending}
                  className="bg-success hover:bg-success/90 text-white uppercase tracking-widest text-[10px] font-black"
                >
                  Approve
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/20 py-8">
        <Sparkles className="w-3 h-3" /> Evaluation Chamber{" "}
        <Sparkles className="w-3 h-3" />
      </div>
    </div>
  );
}
