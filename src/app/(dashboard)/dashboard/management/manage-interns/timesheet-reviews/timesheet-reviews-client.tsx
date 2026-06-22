"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Search,
  Sparkles,
  Star,
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
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useManageTimesheets,
  useManageWeeklyReviews,
  useReviewTimesheet,
  useReviewWeeklyReview,
} from "@/features/intern/hooks/use-manage-interns";
import type { TTimesheet, TWeeklyReview } from "@/features/intern/types";
import {
  formatTasksAssigned,
  formatTasksCompleted,
} from "@/features/intern/utils/intern-helpers";

export function TimesheetReviewsPageClient() {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState<"DAILY" | "WEEKLY">("DAILY");
  const [page, setPage] = useState(1);
  const [perPage, _setPerPage] = useState(10);

  // Review states
  const [selectedTimesheet, setSelectedTimesheet] = useState<TTimesheet | null>(
    null,
  );
  const [selectedWeeklyReview, setSelectedWeeklyReview] =
    useState<TWeeklyReview | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState("");

  const statusColorClass: Record<string, string> = {
    ALL: "",
    PENDING: "text-warning",
    APPROVED: "text-success",
    REJECTED: "text-destructive",
  };

  const { data: timesheetsData, isLoading: isTimesheetsLoading } =
    useManageTimesheets(
      {
        page,
        perPage,
        search: searchText || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      },
      typeFilter === "DAILY",
    );

  const { data: weeklyReviewsData, isLoading: isWeeklyReviewsLoading } =
    useManageWeeklyReviews(
      {
        page,
        perPage,
        search: searchText || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      },
      typeFilter === "WEEKLY",
    );

  const listData = typeFilter === "DAILY" ? timesheetsData : weeklyReviewsData;
  const isLoading =
    typeFilter === "DAILY" ? isTimesheetsLoading : isWeeklyReviewsLoading;

  const reviewTimesheetMutation = useReviewTimesheet(
    selectedTimesheet?.id || "",
  );
  const reviewWeeklyMutation = useReviewWeeklyReview(
    selectedWeeklyReview?.id || "",
  );

  const totalPages = listData?.pagination?.totalPages ?? 1;
  const totalCount = listData?.pagination?.count ?? 0;
  const rows = (listData?.data ?? []) as unknown as Data[];

  const isDaily = typeFilter === "DAILY";
  const activeItem = isDaily ? selectedTimesheet : selectedWeeklyReview;
  const activeStatus = activeItem?.status;

  const columnOrder = isDaily
    ? [
        {
          column: "user_name",
          Label: "Intern Name",
          isSortable: true,
          wrap: (data: string, _id: string, row: Data) => (
            <div className="flex flex-col">
              <span className="font-bold text-foreground uppercase tracking-tight text-sm">
                {String(
                  data ||
                    (row as unknown as Record<string, unknown>).full_name ||
                    "Unknown",
                )}
              </span>
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mt-1">
                {((row as unknown as Record<string, unknown>).muid as string) ||
                  ""}
              </span>
            </div>
          ),
        },
        {
          column: "entry_date",
          Label: "Log Date",
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
          column: "hours",
          Label: "Hours",
          isSortable: true,
          wrap: (data: string) => (
            <span className="text-xs font-bold text-foreground">
              {data} hrs
            </span>
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
      ]
    : [
        {
          column: "user_name",
          Label: "Intern Name",
          isSortable: true,
          wrap: (data: string, _id: string, row: Data) => (
            <div className="flex flex-col">
              <span className="font-bold text-foreground uppercase tracking-tight text-sm">
                {String(
                  data ||
                    (row as unknown as Record<string, unknown>).full_name ||
                    "Unknown",
                )}
              </span>
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mt-1">
                {((row as unknown as Record<string, unknown>).muid as string) ||
                  ""}
              </span>
            </div>
          ),
        },
        {
          column: "iso_week",
          Label: "Week",
          isSortable: true,
          wrap: (data: string, _id: string, row: Data) => {
            const r = row as unknown as TWeeklyReview;
            return (
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">
                  Week {data} ({r.iso_year})
                </span>
                <span className="text-[10px] text-muted-foreground/80 font-semibold mt-0.5">
                  {new Date(r.week_start_date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  -{" "}
                  {new Date(r.week_end_date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            );
          },
        },
        {
          column: "team",
          Label: "Team / Guild",
          isSortable: true,
          wrap: (data: string) => (
            <Badge
              variant="outline"
              className="font-bold uppercase tracking-wider"
            >
              {String(data || "-")}
            </Badge>
          ),
        },
        {
          column: "hours_committed",
          Label: "Hours Committed",
          isSortable: true,
          wrap: (data: string) => (
            <span className="text-xs font-bold text-foreground">
              {data} hrs
            </span>
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
            <Trophy className="w-10 h-10 text-brand-blue" />
            Timesheet Reviews
          </h2>
          <p className="text-muted-foreground mt-1 font-medium italic">
            Evaluate and verify logs and weekly review entries submitted by
            interns.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Switcher button at the top of search */}
        <div className="flex items-center gap-1 rounded-xl border border-border/40 bg-muted/40 p-1 w-fit h-12">
          <button
            type="button"
            onClick={() => {
              setTypeFilter("DAILY");
              setPage(1);
            }}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors h-10 flex items-center ${
              typeFilter === "DAILY"
                ? "bg-background text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Daily Logs
          </button>
          <button
            type="button"
            onClick={() => {
              setTypeFilter("WEEKLY");
              setPage(1);
            }}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors h-10 flex items-center ${
              typeFilter === "WEEKLY"
                ? "bg-background text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Weekly Reviews
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
              <Input
                placeholder="Search by Name or MUID..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setPage(1);
                }}
                className="pl-12 h-12 bg-card/40 border-border/40 font-bold focus:ring-primary/20 w-full text-sm rounded-md"
              />
            </div>
          </div>

          <div className="w-full sm:w-48">
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
              <SelectTrigger
                className={`w-full h-12 bg-card/40 border-border/40 font-black uppercase text-[10px] tracking-widest rounded-md ${statusColorClass[statusFilter] ?? ""}`}
              >
                <SelectValue placeholder="Pending" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="bg-card font-bold border-border/60"
              >
                <SelectItem value="ALL" className="uppercase text-[10px]">
                  All Logs
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
              if (typeFilter === "DAILY") {
                setSelectedTimesheet(row as unknown as TTimesheet);
                setSelectedWeeklyReview(null);
                setReviewNote(row.review_note ? String(row.review_note) : "");
              } else {
                setSelectedWeeklyReview(row as unknown as TWeeklyReview);
                setSelectedTimesheet(null);
                setReviewNote(row.review_note ? String(row.review_note) : "");
              }
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
            handleNextClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </div>
      </Table>

      <Dialog
        open={isReviewOpen}
        onOpenChange={(open) => {
          setIsReviewOpen(open);
          if (!open) {
            setSelectedTimesheet(null);
            setSelectedWeeklyReview(null);
            setReviewNote("");
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className={`bg-card/95 backdrop-blur-xl border-border/60 w-full max-w-[calc(100%-2rem)] ${
            typeFilter === "WEEKLY" ? "sm:max-w-2xl" : "sm:max-w-lg"
          }`}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-wider text-foreground">
              {typeFilter === "DAILY"
                ? "Evaluate Daily Timesheet"
                : "Evaluate Weekly Review"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {typeFilter === "DAILY"
                ? "Review accomplishments and approve daily logs."
                : "Evaluate weekly performance, self-rating, and achievements."}
            </DialogDescription>
          </DialogHeader>

          {isDaily &&
            selectedTimesheet &&
            (() => {
              const muid =
                ((selectedTimesheet as unknown as Record<string, unknown>)
                  .muid as string) || "";
              return (
                <div className="space-y-4 py-2 my-2 text-sm w-full min-w-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Intern
                      </span>
                      <span className="font-bold text-foreground text-sm">
                        {String(
                          (
                            selectedTimesheet as unknown as Record<
                              string,
                              unknown
                            >
                          ).user_name ||
                            (
                              selectedTimesheet as unknown as Record<
                                string,
                                unknown
                              >
                            ).full_name ||
                            "Unknown",
                        )}
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
                        Time Spent
                      </span>
                      <span className="font-bold text-foreground text-sm">
                        {selectedTimesheet.hours} Hour
                        {Number(selectedTimesheet.hours) !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Log Date
                      </span>
                      <span className="font-bold text-foreground text-sm">
                        {new Date(
                          selectedTimesheet.entry_date,
                        ).toLocaleDateString(undefined, {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Status
                      </span>
                      <div className="mt-1">
                        {selectedTimesheet.status === "APPROVED" && (
                          <Badge
                            variant="outline"
                            className="gap-1.5 text-success border-success/30 font-bold uppercase text-xs"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </Badge>
                        )}
                        {selectedTimesheet.status === "REJECTED" && (
                          <Badge
                            variant="outline"
                            className="gap-1.5 text-destructive border-destructive/30 font-bold uppercase text-xs"
                          >
                            <XCircle className="w-3 h-3" /> Rejected
                          </Badge>
                        )}
                        {selectedTimesheet.status === "PENDING" && (
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
                      Log Description
                    </span>
                    {selectedTimesheet.description ? (
                      <div className="bg-muted/40 p-2.5 rounded-lg border border-border/20 max-h-40 overflow-y-auto leading-relaxed mt-1">
                        <MarkdownRenderer
                          content={selectedTimesheet.description}
                          className="text-xs"
                        />
                      </div>
                    ) : (
                      <p className="text-xs italic text-muted-foreground mt-1">
                        No description provided.
                      </p>
                    )}
                  </div>

                  {selectedTimesheet.blockers &&
                    selectedTimesheet.blockers !== "None" && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                          Blockers
                        </span>
                        <p className="bg-destructive/5 text-destructive p-2.5 rounded-lg text-xs font-semibold mt-1 border border-destructive/20 leading-relaxed break-words">
                          {selectedTimesheet.blockers}
                        </p>
                      </div>
                    )}

                  {selectedTimesheet.status === "PENDING" ? (
                    <div className="space-y-2 pt-2 border-t border-border/20 flex flex-col gap-1">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        Review Notes / Feedback
                      </Label>
                      <Textarea
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        placeholder="Feedback visible to the intern..."
                        className="min-h-[80px] text-xs font-semibold resize-none"
                      />
                    </div>
                  ) : (
                    selectedTimesheet.review_note && (
                      <div className="pt-2 border-t border-border/20 flex flex-col gap-1">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                          Council Review Note
                        </span>
                        <p className="p-2.5 bg-muted/20 border rounded-lg text-xs mt-1 text-muted-foreground leading-relaxed break-words">
                          {selectedTimesheet.review_note}
                        </p>
                      </div>
                    )
                  )}
                </div>
              );
            })()}

          {!isDaily &&
            selectedWeeklyReview &&
            (() => {
              const muid =
                ((selectedWeeklyReview as unknown as Record<string, unknown>)
                  .muid as string) || "";
              const remarks = selectedWeeklyReview.task_remarks;
              return (
                <div className="space-y-4 py-2 my-2 text-sm max-h-[60vh] overflow-y-auto pr-1 w-full min-w-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Intern
                      </span>
                      <span className="font-bold text-foreground text-sm">
                        {String(
                          (
                            selectedWeeklyReview as unknown as Record<
                              string,
                              unknown
                            >
                          ).user_name ||
                            (
                              selectedWeeklyReview as unknown as Record<
                                string,
                                unknown
                              >
                            ).full_name ||
                            "Unknown",
                        )}
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Week
                      </span>
                      <span className="font-bold text-foreground text-sm">
                        Week {selectedWeeklyReview.iso_week} (
                        {selectedWeeklyReview.iso_year})
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Hours Committed
                      </span>
                      <span className="font-bold text-foreground text-sm">
                        {selectedWeeklyReview.hours_committed} hrs
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Team / Guild
                      </span>
                      <div className="inline-flex items-center rounded-full border border-border/40 px-2 py-0.5 text-foreground font-bold text-xs uppercase tracking-wider mt-1 w-fit">
                        {selectedWeeklyReview.team || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Leave Details
                      </span>
                      <span className="font-bold text-foreground text-xs">
                        {selectedWeeklyReview.is_on_leave
                          ? `On Leave (${selectedWeeklyReview.leave_days} days)`
                          : "No Leave"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Submission Time
                      </span>
                      <div className="font-bold text-foreground text-xs mt-1">
                        {selectedWeeklyReview.is_late ? (
                          <Badge
                            variant="outline"
                            className="text-destructive border-destructive/20 text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5"
                          >
                            LATE
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-success border-success/20 text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5"
                          >
                            ON TIME
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {remarks?.rating && (
                    <div className="flex flex-col gap-1 border-t border-border/20 pt-3">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Self Rating
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <Star
                            key={num}
                            className={`w-4 h-4 ${
                              num <= (remarks.rating || 0)
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold ml-1 text-foreground">
                          {remarks.rating} / 5
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedWeeklyReview.weekly_review && (
                    <div className="flex flex-col gap-1 border-t border-border/20 pt-3">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Weekly Summary
                      </span>
                      <div className="bg-muted/40 p-2.5 rounded-lg border border-border/20 max-h-40 overflow-y-auto leading-relaxed mt-1">
                        <MarkdownRenderer
                          content={selectedWeeklyReview.weekly_review}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border/20 pt-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Tasks Assigned
                      </span>
                      <div className="bg-muted/30 p-2 rounded-lg border border-border/10 max-h-32 overflow-y-auto leading-relaxed mt-1 text-xs">
                        <MarkdownRenderer
                          content={formatTasksAssigned(
                            selectedWeeklyReview.tasks_assigned,
                          )}
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Tasks Completed
                      </span>
                      <div className="bg-muted/30 p-2 rounded-lg border border-border/10 max-h-32 overflow-y-auto leading-relaxed mt-1 text-xs">
                        <MarkdownRenderer
                          content={formatTasksCompleted(
                            selectedWeeklyReview.tasks_completed,
                          )}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {(remarks?.learnings ||
                    remarks?.challenges_faced ||
                    remarks?.next_week_plan) && (
                    <div className="space-y-3 border-t border-border/20 pt-3">
                      {remarks.learnings && (
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
                            Key Learnings
                          </span>
                          <p className="bg-muted/20 p-2.5 rounded-lg text-xs mt-1 border border-border/10 leading-relaxed text-foreground font-medium break-words">
                            {remarks.learnings}
                          </p>
                        </div>
                      )}

                      {remarks.challenges_faced && (
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                            Challenges Faced
                          </span>
                          <p className="bg-muted/20 p-2.5 rounded-lg text-xs mt-1 border border-border/10 leading-relaxed text-foreground font-medium break-words">
                            {remarks.challenges_faced}
                          </p>
                        </div>
                      )}

                      {remarks.next_week_plan && (
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                            Next Week Plan
                          </span>
                          <p className="bg-muted/20 p-2.5 rounded-lg text-xs mt-1 border border-border/10 leading-relaxed text-foreground font-medium break-words">
                            {remarks.next_week_plan}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedWeeklyReview.blockers && (
                    <div className="flex flex-col gap-1 border-t border-border/20 pt-3">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Blockers
                      </span>
                      <p className="bg-destructive/5 text-destructive p-2.5 rounded-lg text-xs font-semibold mt-1 border border-destructive/20 leading-relaxed break-words">
                        {selectedWeeklyReview.blockers}
                      </p>
                    </div>
                  )}

                  {selectedWeeklyReview.suggestions && (
                    <div className="flex flex-col gap-1 border-t border-border/20 pt-3">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Suggestions
                      </span>
                      <p className="bg-muted/20 p-2.5 rounded-lg text-xs mt-1 border border-border/10 leading-relaxed text-muted-foreground font-medium break-words">
                        {selectedWeeklyReview.suggestions}
                      </p>
                    </div>
                  )}

                  {selectedWeeklyReview.status === "PENDING" ? (
                    <div className="space-y-2 pt-3 border-t border-border/20 flex flex-col gap-1">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        Review Notes / Feedback
                      </Label>
                      <Textarea
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        placeholder="Feedback visible to the intern..."
                        className="min-h-[80px] text-xs font-semibold resize-none"
                      />
                    </div>
                  ) : (
                    selectedWeeklyReview.review_note && (
                      <div className="pt-3 border-t border-border/20 flex flex-col gap-1">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                          Council Review Note
                        </span>
                        <p className="p-2.5 bg-muted/20 border rounded-lg text-xs mt-1 text-muted-foreground leading-relaxed break-words">
                          {selectedWeeklyReview.review_note}
                        </p>
                      </div>
                    )
                  )}
                </div>
              );
            })()}

          <DialogFooter className="gap-2 sm:justify-between border-t border-border/20 pt-4">
            {activeStatus === "PENDING" ? (
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
                      if (isDaily) {
                        reviewTimesheetMutation.mutate(
                          { action: "reject", review_note: reviewNote },
                          {
                            onSuccess: () => {
                              setIsReviewOpen(false);
                              setReviewNote("");
                              setSelectedTimesheet(null);
                            },
                          },
                        );
                      } else {
                        reviewWeeklyMutation.mutate(
                          { action: "reject", review_note: reviewNote },
                          {
                            onSuccess: () => {
                              setIsReviewOpen(false);
                              setReviewNote("");
                              setSelectedWeeklyReview(null);
                            },
                          },
                        );
                      }
                    }}
                    disabled={
                      isDaily
                        ? reviewTimesheetMutation.isPending
                        : reviewWeeklyMutation.isPending
                    }
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive hover:text-white hover:border-destructive hover:bg-none gap-2 text-[10px] tracking-widest h-10 shadow-lg font-bold"
                  >
                    Reject
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (isDaily) {
                        reviewTimesheetMutation.mutate(
                          { action: "approve", review_note: reviewNote },
                          {
                            onSuccess: () => {
                              setIsReviewOpen(false);
                              setReviewNote("");
                              setSelectedTimesheet(null);
                            },
                          },
                        );
                      } else {
                        reviewWeeklyMutation.mutate(
                          { action: "approve", review_note: reviewNote },
                          {
                            onSuccess: () => {
                              setIsReviewOpen(false);
                              setReviewNote("");
                              setSelectedWeeklyReview(null);
                            },
                          },
                        );
                      }
                    }}
                    disabled={
                      isDaily
                        ? reviewTimesheetMutation.isPending
                        : reviewWeeklyMutation.isPending
                    }
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
    </div>
  );
}
