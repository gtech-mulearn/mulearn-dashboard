"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  Search,
  Trophy,
  XCircle,
} from "lucide-react";
import { useState } from "react";
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
  formatReviewMonth,
  getTimesheetDisplayStatus,
  type TAdminMonthlyReview,
  type TTimesheet,
  useManageMonthlyReviews,
  useManageTimesheets,
} from "@/features/intern";
import { useDebounce } from "@/hooks/use-debounce";
import { ReviewDetailDialog } from "./components/review-detail-dialog";

type TTypeFilter = "DAILY" | "MONTHLY";

/** Columns the monthly list can sort by on the server. */
const MONTHLY_SORTABLE = new Set(["created_at", "year", "month", "status"]);

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2000, i, 1).toLocaleDateString(undefined, { month: "long" }),
}));

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map(
  String,
);

const statusColorClass: Record<string, string> = {
  ALL: "",
  PENDING: "text-warning",
  APPROVED: "text-success",
  REJECTED: "text-destructive",
};

function InternCell({ name, muid }: { name: string; muid?: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-bold text-foreground uppercase tracking-tight text-sm">
        {name || "Unknown"}
      </span>
      <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mt-1">
        {muid || ""}
      </span>
    </div>
  );
}

function ReviewStatusBadge({ status }: { status: string }) {
  switch (status) {
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
}

export function TimesheetsPageClient() {
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText.trim(), 400);
  const [typeFilter, setTypeFilter] = useState<TTypeFilter>("DAILY");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [muidFilter, setMuidFilter] = useState("");
  const debouncedMuid = useDebounce(muidFilter.trim(), 400);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [selectedTimesheet, setSelectedTimesheet] = useState<TTimesheet | null>(
    null,
  );
  const [selectedMonthlyReview, setSelectedMonthlyReview] =
    useState<TAdminMonthlyReview | null>(null);

  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    undefined,
  );

  const isDaily = typeFilter === "DAILY";

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
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
      },
      isDaily,
    );

  const { data: monthlyData, isLoading: isMonthlyLoading } =
    useManageMonthlyReviews(
      {
        page,
        perPage,
        search: debouncedSearch || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        year: yearFilter === "ALL" ? undefined : Number(yearFilter),
        month: monthFilter === "ALL" ? undefined : Number(monthFilter),
        muid: debouncedMuid || undefined,
        sortBy,
        sortOrder,
      },
      !isDaily,
    );

  const listData = isDaily ? timesheetsData : monthlyData;
  const isLoading = isDaily ? isTimesheetsLoading : isMonthlyLoading;

  const totalPages = listData?.pagination?.totalPages ?? 1;
  const totalCount = listData?.pagination?.count ?? 0;
  const rows = (listData?.data ?? []) as unknown as Data[];

  const dailyColumns = [
    {
      column: "user_name",
      Label: "Intern Name",
      isSortable: true,
      wrap: (data: string, _id: string, row: Data) => (
        <InternCell
          name={String(data || "")}
          muid={(row as unknown as TTimesheet).muid}
        />
      ),
    },
    {
      column: "entry_date",
      Label: "Log Date",
      isSortable: true,
      wrap: (data: string) => (
        <span className="text-xs font-bold text-foreground">
          {new Date(`${data}T00:00:00`).toLocaleDateString(undefined, {
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
        <span className="text-xs font-bold text-foreground">{data} hrs</span>
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
      wrap: (data: string) =>
        getTimesheetDisplayStatus(data as TTimesheet["status"]) ===
        "MISSING" ? (
          <Badge
            variant="outline"
            className="gap-1.5 text-destructive border-destructive/30"
          >
            <XCircle className="w-3 h-3" /> Missing
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="gap-1.5 text-success border-success/30"
          >
            <CheckCircle2 className="w-3 h-3" /> Submitted
          </Badge>
        ),
    },
  ];

  const monthlyColumns = [
    {
      column: "user_name",
      Label: "Intern Name",
      isSortable: false,
      wrap: (data: string, _id: string, row: Data) => (
        <InternCell
          name={String(data || "")}
          muid={(row as unknown as TAdminMonthlyReview).muid}
        />
      ),
    },
    {
      column: "month",
      Label: "Month",
      isSortable: true,
      wrap: (_data: string, _id: string, row: Data) => (
        <span className="text-xs font-bold text-foreground">
          {formatReviewMonth(row as unknown as TAdminMonthlyReview)}
        </span>
      ),
    },
    {
      column: "team",
      Label: "Team",
      isSortable: false,
      wrap: (data: string) => (
        <Badge variant="outline" className="font-bold uppercase tracking-wider">
          {String(data || "-")}
        </Badge>
      ),
    },
    {
      column: "leave_days",
      Label: "Leave Days",
      isSortable: false,
      wrap: (data: string) => (
        <span className="text-xs font-bold text-foreground">{data ?? 0}</span>
      ),
    },
    {
      column: "task_remarks",
      Label: "Rating",
      isSortable: false,
      wrap: (_data: string, _id: string, row: Data) => {
        const rating = (row as unknown as TAdminMonthlyReview).task_remarks
          ?.rating;
        return (
          <span className="text-xs font-bold text-foreground">
            {rating ? `${rating} / 5` : "-"}
          </span>
        );
      },
    },
    {
      column: "created_at",
      Label: "Submitted",
      isSortable: true,
      wrap: (data: string) => (
        <span className="text-xs font-bold text-foreground">
          {data
            ? new Date(data).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "-"}
        </span>
      ),
    },
    {
      column: "status",
      Label: "Status",
      isSortable: true,
      wrap: (data: string) => <ReviewStatusBadge status={data} />,
    },
  ];

  const columnOrder = isDaily ? dailyColumns : monthlyColumns;

  const switchType = (type: TTypeFilter) => {
    setTypeFilter(type);
    setPage(1);
    setSortBy(undefined);
    setSortOrder(undefined);
  };

  const resetPage = () => setPage(1);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase flex items-center gap-3">
            <Trophy className="w-10 h-10 text-brand-blue" />
            Timesheets &amp; Reviews
          </h2>
          <p className="text-muted-foreground mt-1 font-medium italic">
            View interns' daily timesheets and evaluate their monthly reviews.
          </p>
        </div>

        {/* Switcher */}
        <div className="flex flex-wrap items-center gap-1 p-1 w-fit h-auto sm:h-12 shrink-0">
          <Button
            type="button"
            size="default"
            variant={isDaily ? "default" : "outline"}
            onClick={() => switchType("DAILY")}
            className="gap-1.5 text-[10px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.2em] px-3 sm:px-4"
          >
            Daily Logs
          </Button>
          <Button
            type="button"
            size="default"
            variant={!isDaily ? "default" : "outline"}
            onClick={() => switchType("MONTHLY")}
            className="gap-1.5 text-[10px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.2em] px-3 sm:px-4"
          >
            Monthly Reviews
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <Input
              placeholder={
                isDaily
                  ? "Search by Name or MUID..."
                  : "Search by Name, MUID or Team..."
              }
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                resetPage();
              }}
              className="pl-12 h-12 bg-card/40 border-border/40 font-bold focus:ring-primary/20 w-full text-sm rounded-md"
            />
          </div>
        </div>

        {!isDaily && (
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Exact MUID"
              value={muidFilter}
              onChange={(e) => {
                setMuidFilter(e.target.value);
                resetPage();
              }}
              className="w-full sm:w-44 h-12 bg-card/40 border-border/40 font-bold text-xs rounded-md"
            />
            <Select
              value={yearFilter}
              onValueChange={(v) => {
                setYearFilter(v);
                resetPage();
              }}
            >
              <SelectTrigger className="w-full sm:w-28 h-12 bg-card/40 border-border/40 font-black uppercase text-[10px] tracking-widest rounded-md">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent position="popper" className="bg-card font-bold">
                <SelectItem value="ALL" className="uppercase text-[10px]">
                  All Years
                </SelectItem>
                {YEAR_OPTIONS.map((y) => (
                  <SelectItem key={y} value={y} className="text-[10px]">
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={monthFilter}
              onValueChange={(v) => {
                setMonthFilter(v);
                resetPage();
              }}
            >
              <SelectTrigger className="w-full sm:w-36 h-12 bg-card/40 border-border/40 font-black uppercase text-[10px] tracking-widest rounded-md">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent position="popper" className="bg-card font-bold">
                <SelectItem value="ALL" className="uppercase text-[10px]">
                  All Months
                </SelectItem>
                {MONTH_OPTIONS.map((m) => (
                  <SelectItem
                    key={m.value}
                    value={m.value}
                    className="uppercase text-[10px]"
                  >
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                resetPage();
              }}
            >
              <SelectTrigger
                className={`w-full sm:w-40 h-12 bg-card/40 border-border/40 font-black uppercase text-[10px] tracking-widest rounded-md ${statusColorClass[statusFilter] ?? ""}`}
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent position="popper" className="bg-card font-bold">
                <SelectItem value="ALL" className="uppercase text-[10px]">
                  All Statuses
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
        )}
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
              if (isDaily) {
                setSelectedTimesheet(row as unknown as TTimesheet);
              } else {
                setSelectedMonthlyReview(row as unknown as TAdminMonthlyReview);
              }
            }}
            className="rounded-md text-muted-foreground hover:bg-muted hover:text-foreground font-black uppercase text-xs tracking-widest"
          >
            {!isDaily && row.status === "PENDING" ? "Evaluate" : "View"}
          </Button>
        )}
      >
        <thead>
          <tr>
            <th className="border-b border-border px-3.5 py-3 text-left text-sm font-bold uppercase tracking-wider w-16 bg-muted/20 h-12 font-black text-[9px] tracking-[0.3em]">
              Sl.no
            </th>
            {columnOrder.map((col) => {
              const sortable =
                col.isSortable && (isDaily || MONTHLY_SORTABLE.has(col.column));
              return (
                <th
                  key={col.column}
                  className={`border-b border-border px-3.5 py-3 text-left text-sm font-bold tracking-wider bg-muted/20 h-12 font-black uppercase text-[9px] tracking-[0.3em] ${
                    sortable
                      ? "cursor-pointer select-none hover:bg-muted/10 transition-colors"
                      : ""
                  }`}
                  onClick={() => sortable && handleSort(col.column)}
                >
                  <div className="flex items-center gap-2">
                    <span>{col.Label}</span>
                    {sortable && (
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
              );
            })}
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

      <ReviewDetailDialog
        selectedTimesheet={selectedTimesheet}
        selectedMonthlyReview={selectedMonthlyReview}
        onClose={() => {
          setSelectedTimesheet(null);
          setSelectedMonthlyReview(null);
        }}
      />
    </div>
  );
}
