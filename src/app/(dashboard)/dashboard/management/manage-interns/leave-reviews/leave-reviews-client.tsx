"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Search,
  Shield,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useManageLeaves,
  useReviewLeave,
} from "@/features/intern/hooks/use-manage-interns";
import type { TLeaveRequest } from "@/features/intern/types";

const calculateDurationDays = (startStr: string, endStr: string) => {
  if (!startStr || !endStr) return 0;
  const start = new Date(startStr);
  const end = new Date(endStr);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diffTime = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24))) + 1;
};

export function LeaveReviewsPageClient() {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [perPage, _setPerPage] = useState(10);

  // Review states
  const [selectedLeave, setSelectedLeave] = useState<TLeaveRequest | null>(
    null,
  );
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState("");

  const statusColorClass: Record<string, string> = {
    ALL: "",
    PENDING: "text-warning",
    APPROVED: "text-success",
    REJECTED: "text-destructive",
    CANCELLED: "text-muted-foreground",
  };

  const { data: listData, isLoading } = useManageLeaves({
    page,
    perPage,
    search: searchText || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const reviewMutation = useReviewLeave(selectedLeave?.id || "");

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
          <span className="font-bold text-foreground uppercase tracking-tight text-sm">
            {String(data || (row as any).full_name || "Unknown")}
          </span>
          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mt-1">
            {(row as any).user_muid || (row as any).muid || ""}
          </span>
        </div>
      ),
    },
    {
      column: "leave_type",
      Label: "Leave Type",
      isSortable: true,
      wrap: (data: string) => (
        <Badge
          variant="outline"
          className="font-bold uppercase text-muted-foreground/80 tracking-wider"
        >
          {String(data)}
        </Badge>
      ),
    },
    {
      column: "start_date",
      Label: "Start Date",
      isSortable: true,
      wrap: (data: string) => (
        <span className="text-xs font-bold text-foreground">
          {new Date(data).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      column: "end_date",
      Label: "End Date",
      isSortable: true,
      wrap: (data: string) => (
        <span className="text-xs font-bold text-foreground">
          {new Date(data).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      column: "duration_days",
      Label: "Days",
      isSortable: true,
      wrap: (data: string, _id: string, row: Data) => {
        let days = data ? Number(data) : null;
        if ((!days || Number.isNaN(days)) && row.start_date && row.end_date) {
          const start = new Date(row.start_date as string);
          const end = new Date(row.end_date as string);
          start.setHours(0, 0, 0, 0);
          end.setHours(0, 0, 0, 0);
          const diffTime = end.getTime() - start.getTime();
          const diffDays =
            Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24))) + 1;
          days = diffDays;
        }
        return (
          <span className="text-xs font-bold text-foreground">
            {days ? `${days} day${days > 1 ? "s" : ""}` : "-"}
          </span>
        );
      },
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
                className="gap-1.5 text-success border-success/30"
              >
                <CheckCircle2 className="w-3 h-3" /> Approved
              </Badge>
            );
          case "REJECTED":
            return (
              <Badge
                variant="outline"
                className="gap-1.5 text-destructive border-destructive/30"
              >
                <XCircle className="w-3 h-3" /> Rejected
              </Badge>
            );
          case "CANCELLED":
            return (
              <Badge
                variant="outline"
                className="gap-1.5 text-muted-foreground border-border"
              >
                <Shield className="w-3 h-3" /> Cancelled
              </Badge>
            );
          default:
            return (
              <Badge
                variant="outline"
                className="gap-1.5 text-warning border-warning/30"
              >
                <AlertTriangle className="w-3 h-3" /> Pending
              </Badge>
            );
        }
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase flex items-center gap-3">
            <Trophy className="w-10 h-10 text-warning" />
            Leave Reviews
          </h2>
          <p className="text-muted-foreground mt-1 font-medium italic">
            Evaluate and approve/reject leave requests submitted by interns.
          </p>
        </div>
      </div>

      <div className="space-y-4">
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
                className="pl-12 h-12 bg-card/40 border-border/40 font-bold focus:ring-primary/20 w-full max-w-xl text-sm rounded-md"
              />
            </div>
          </div>

          <div className="w-full lg:w-48 flex gap-4">
            <div className="flex-1">
              <Label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-right">
                Status Filter
              </Label>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger
                  className={`w-full h-12 bg-card/40 border-border/40 font-black uppercase text-[10px] tracking-widest rounded-md ${statusColorClass[statusFilter] ?? ""}`}
                >
                  <SelectValue placeholder="Pending" />
                </SelectTrigger>
                <SelectContent className="bg-card font-bold border-border/60">
                  <SelectItem value="ALL" className="uppercase text-[10px]">
                    All Leaves
                  </SelectItem>
                  <SelectItem
                    value="PENDING"
                    className="uppercase text-[10px] text-warning"
                  >
                    Pending
                  </SelectItem>
                  <SelectItem
                    value="APPROVED"
                    className="uppercase text-[10px] text-success"
                  >
                    Approved
                  </SelectItem>
                  <SelectItem
                    value="REJECTED"
                    className="uppercase text-[10px] text-destructive"
                  >
                    Rejected
                  </SelectItem>
                  <SelectItem
                    value="CANCELLED"
                    className="uppercase text-[10px] text-muted-foreground"
                  >
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Table
          rows={rows}
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
                setSelectedLeave(row as unknown as TLeaveRequest);
                setReviewNote(row.review_note ? String(row.review_note) : "");
                setIsReviewOpen(true);
              }}
              className="rounded-md text-muted-foreground hover:bg-muted hover:text-foreground font-black uppercase text-[9px] tracking-widest px-3 h-7.5"
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
      </div>

      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent
          showCloseButton={false}
          className="bg-card/95 backdrop-blur-xl border-border/60 w-full max-w-[calc(100%-2rem)] sm:max-w-lg p-4 sm:p-6"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-wider text-foreground">
              Evaluate Leave Request
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review details and approve/reject leave requests.
            </DialogDescription>
          </DialogHeader>

          {selectedLeave &&
            (() => {
              const muid =
                selectedLeave.user_muid || (selectedLeave as any).muid || "";
              const days =
                selectedLeave.duration_days ||
                calculateDurationDays(
                  selectedLeave.start_date,
                  selectedLeave.end_date,
                );
              return (
                <div className="space-y-4 py-2 my-2 text-sm w-full min-w-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Intern
                      </span>
                      <span className="font-bold text-foreground text-sm">
                        {selectedLeave.user_name || "Unknown"}
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Submission Date
                      </span>
                      <span className="font-bold text-foreground text-sm">
                        {new Date(selectedLeave.created_at).toLocaleDateString(
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
                    <div className="flex flex-col gap-1 items-start">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Leave Type
                      </span>
                      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground font-bold text-xs uppercase tracking-wider mt-1">
                        {selectedLeave.leave_type}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Start Date
                      </span>
                      <span className="font-bold text-foreground text-sm">
                        {new Date(selectedLeave.start_date).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        End Date
                      </span>
                      <span className="font-bold text-foreground text-sm">
                        {new Date(selectedLeave.end_date).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Duration Days
                      </span>
                      <span className="font-bold text-foreground text-sm">
                        {days ? `${days} Day${days > 1 ? "s" : ""}` : "-"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Status
                      </span>
                      <div className="mt-1">
                        {selectedLeave.status === "APPROVED" && (
                          <Badge
                            variant="outline"
                            className="gap-1.5 text-success border-success/30 font-bold uppercase text-xs"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </Badge>
                        )}
                        {selectedLeave.status === "REJECTED" && (
                          <Badge
                            variant="outline"
                            className="gap-1.5 text-destructive border-destructive/30 font-bold uppercase text-xs"
                          >
                            <XCircle className="w-3 h-3" /> Rejected
                          </Badge>
                        )}
                        {selectedLeave.status === "CANCELLED" && (
                          <Badge
                            variant="outline"
                            className="gap-1.5 text-muted-foreground border-border font-bold uppercase text-xs"
                          >
                            <Shield className="w-3 h-3" /> Cancelled
                          </Badge>
                        )}
                        {selectedLeave.status === "PENDING" && (
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

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Reason for Respite
                    </span>
                    <p className="bg-muted/40 p-2.5 rounded-lg text-xs font-semibold text-foreground/80 mt-1 border border-border/20 max-h-40 overflow-y-auto leading-relaxed break-words">
                      {selectedLeave.reason || "No reason provided."}
                    </p>
                  </div>

                  {selectedLeave.status === "PENDING" ? (
                    <div className="space-y-2 pt-2 border-t border-border/20 flex flex-col gap-1">
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
                    selectedLeave.review_note && (
                      <div className="pt-2 border-t border-border/20 flex flex-col gap-1">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                          Council Review Note
                        </span>
                        <p className="p-2.5 bg-muted/20 border rounded-lg text-xs mt-1 text-muted-foreground leading-relaxed break-words">
                          {selectedLeave.review_note}
                        </p>
                      </div>
                    )
                  )}
                </div>
              );
            })()}

          <DialogFooter className="gap-2 sm:justify-between border-t border-border/20 pt-4">
            {selectedLeave?.status === "PENDING" ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsReviewOpen(false)}
                  className="gap-2 text-[10px] tracking-widest h-10 shadow-lg"
                >
                  Close
                </Button>
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
                            setSelectedLeave(null);
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
                      reviewMutation.mutate(
                        { action: "approve", review_note: reviewNote },
                        {
                          onSuccess: () => {
                            setIsReviewOpen(false);
                            setReviewNote("");
                            setSelectedLeave(null);
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
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReviewOpen(false)}
                className="w-full gap-2 text-[10px] tracking-widest h-10 shadow-lg font-bold"
              >
                Close
              </Button>
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
