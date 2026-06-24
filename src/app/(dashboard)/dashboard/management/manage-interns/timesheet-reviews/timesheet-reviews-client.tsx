"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  Search,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useManageTimesheets,
  useManageWeeklyReviews,
} from "@/features/intern/hooks/use-manage-interns";
import type { TTimesheet, TWeeklyReview } from "@/features/intern/types";
import { TimesheetEvaluateDialog } from "./components/timesheet-evaluate-dialog";

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

  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    undefined,
  );

  const handleSort = (column: string) => {
    if (sortBy === column) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        setSortBy(undefined);
        setSortOrder(undefined);
      }
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const { data: timesheetsData, isLoading: isTimesheetsLoading } =
    useManageTimesheets(
      {
        page,
        perPage,
        search: searchText || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        sortBy,
        sortOrder,
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
        sortBy,
        sortOrder,
      },
      typeFilter === "WEEKLY",
    );

  const listData = typeFilter === "DAILY" ? timesheetsData : weeklyReviewsData;
  const isLoading =
    typeFilter === "DAILY" ? isTimesheetsLoading : isWeeklyReviewsLoading;

  const totalPages = listData?.pagination?.totalPages ?? 1;
  const totalCount = listData?.pagination?.count ?? 0;

  const rows = useMemo(() => {
    const data = (listData?.data ?? []) as unknown as Data[];
    const resolved = [...data];
    if (sortBy) {
      resolved.sort((a, b) => {
        let valA = a[sortBy as keyof Data];
        let valB = b[sortBy as keyof Data];

        if (valA === undefined || valA === null) valA = "";
        if (valB === undefined || valB === null) valB = "";

        if (
          sortBy === "entry_date" ||
          sortBy === "created_at" ||
          sortBy === "week_start_date"
        ) {
          const timeA = valA ? new Date(valA as string).getTime() : 0;
          const timeB = valB ? new Date(valB as string).getTime() : 0;
          const isInvalidA = Number.isNaN(timeA);
          const isInvalidB = Number.isNaN(timeB);
          if (isInvalidA && isInvalidB) return 0;
          if (isInvalidA) return sortOrder === "asc" ? 1 : -1;
          if (isInvalidB) return sortOrder === "asc" ? -1 : 1;
          return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
        }

        const isNumA = typeof valA === "number";
        const isNumB = typeof valB === "number";
        if (isNumA && isNumB) {
          return sortOrder === "asc"
            ? (valA as number) - (valB as number)
            : (valB as number) - (valA as number);
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortOrder === "asc" ? -1 : 1;
        if (strA > strB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    return resolved;
  }, [listData, sortBy, sortOrder]);

  const isDaily = typeFilter === "DAILY";

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

  const handleCloseDialog = () => {
    setIsReviewOpen(false);
    setSelectedTimesheet(null);
    setSelectedWeeklyReview(null);
    setReviewNote("");
  };

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
        {/* Switcher */}
        <div className="flex items-center gap-1 p-1 w-fit h-12">
          <Button
            type="button"
            size="default"
            variant={typeFilter === "DAILY" ? "default" : "outline"}
            onClick={() => {
              setTypeFilter("DAILY");
              setPage(1);
              setSortBy(undefined);
              setSortOrder(undefined);
            }}
            className="gap-1.5 text-xs uppercase tracking-[0.2em]"
          >
            Daily Logs
          </Button>
          <Button
            type="button"
            size="default"
            variant={typeFilter === "WEEKLY" ? "default" : "outline"}
            onClick={() => {
              setTypeFilter("WEEKLY");
              setPage(1);
              setSortBy(undefined);
              setSortOrder(undefined);
            }}
            className="gap-1.5 text-xs uppercase tracking-[0.2em]"
          >
            Weekly Reviews
          </Button>
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
            className="rounded-md text-muted-foreground hover:bg-muted hover:text-foreground font-black uppercase text-xs tracking-widest"
          >
            {row.status === "PENDING" ? "Evaluate" : "View"}
          </Button>
        )}
      >
        <thead>
          <tr>
            <th className="border-b border-border px-3.5 py-3 text-left text-sm font-bold uppercase tracking-wider w-16 bg-muted/20 h-12 font-black text-[9px] tracking-[0.3em]">
              Sl.no
            </th>
            {columnOrder.map((col) => (
              <th
                key={col.column}
                className={`border-b border-border px-3.5 py-3 text-left text-sm font-bold tracking-wider bg-muted/20 h-12 font-black uppercase text-[9px] tracking-[0.3em] ${
                  col.isSortable
                    ? "cursor-pointer select-none hover:bg-muted/10 transition-colors"
                    : ""
                }`}
                onClick={() => col.isSortable && handleSort(col.column)}
              >
                <div className="flex items-center gap-2">
                  <span>{col.Label}</span>
                  {col.isSortable && (
                    <span className="inline-flex shrink-0">
                      {sortBy === col.column ? (
                        sortOrder === "asc" ? (
                          <ArrowUp className="size-3 text-brand-blue font-bold" />
                        ) : (
                          <ArrowDown className="size-3 text-brand-blue font-bold" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3 text-muted-foreground/40" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
            <th className="border-b border-border px-3.5 py-3 text-center text-sm font-bold tracking-wider w-32 bg-muted/20 h-12 font-black uppercase text-[9px] tracking-[0.3em]">
              Action
            </th>
          </tr>
        </thead>
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

      <TimesheetEvaluateDialog
        isOpen={isReviewOpen}
        typeFilter={typeFilter}
        selectedTimesheet={selectedTimesheet}
        selectedWeeklyReview={selectedWeeklyReview}
        reviewNote={reviewNote}
        onOpenChange={setIsReviewOpen}
        onReviewNoteChange={setReviewNote}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
