"use client";

import { Download, Search } from "lucide-react";
import { useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  formatDateOnly,
  formatReviewMonth,
  getISTDateString,
  TeamBadge,
  TeamFilterSelect,
  type TTeamRef,
  useExportMissingMonthlyReviews,
  useExportMissingTimesheets,
  useMissingMonthlyReviews,
  useMissingTimesheets,
} from "@/features/intern";
import { useDebounce } from "@/hooks/use-debounce";

const PER_PAGE = 10;
const inputClass =
  "h-12 bg-card/40 border-border/40 font-bold text-xs rounded-md";
const selectClass =
  "w-full sm:w-36 h-12 bg-card/40 border-border/40 font-black uppercase text-[10px] tracking-widest rounded-md";

function lastMonth(): { year: number; month: number } {
  const [y, m] = getISTDateString().split("-").map(Number);
  return m === 1 ? { year: y - 1, month: 12 } : { year: y, month: m - 1 };
}

const personColumns = [
  {
    column: "full_name",
    Label: "Intern",
    isSortable: false,
    wrap: (data: string, _id: string, row: Data) => (
      <div className="flex flex-col">
        <span className="font-bold text-foreground uppercase tracking-tight text-sm">
          {data}
        </span>
        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">
          {String(row.muid ?? "")}
        </span>
      </div>
    ),
  },
  {
    column: "team",
    Label: "Team",
    isSortable: false,
    wrap: (_data: string, _id: string, row: Data) => (
      <TeamBadge team={row.team as unknown as TTeamRef | null} />
    ),
  },
  {
    column: "status",
    Label: "Status",
    isSortable: false,
    wrap: (data: string) => (
      <Badge variant="outline" className="uppercase text-[10px]">
        {data.replaceAll("_", " ")}
      </Badge>
    ),
  },
];

const dailyColumns = [
  ...personColumns,
  {
    column: "leave_type",
    Label: "On Leave",
    isSortable: false,
    wrap: (_data: string, _id: string, row: Data) =>
      row.on_leave ? (
        <Badge variant="outline" className="text-warning border-warning/30">
          {String(row.leave_type ?? "Leave")}
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground">No</span>
      ),
  },
];

const monthlyColumns = [
  ...personColumns,
  {
    column: "leave_days",
    Label: "Leave Days",
    isSortable: false,
    wrap: (data: string) => (
      <span className="text-xs font-bold text-foreground">{data}</span>
    ),
  },
];

/** "Missing" tab: who hasn't submitted a timesheet (one day) or monthly review (one month). */
export function MissingReports() {
  const today = getISTDateString();
  const defaultMonth = lastMonth();

  const [kind, setKind] = useState<"DAILY" | "MONTHLY">("DAILY");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 400);
  const [teamFilter, setTeamFilter] = useState("ALL");

  const [date, setDate] = useState(today);
  const [onLeave, setOnLeave] = useState<"ALL" | "true" | "false">("ALL");
  const [year, setYear] = useState(defaultMonth.year);
  const [month, setMonth] = useState(defaultMonth.month);

  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");

  const isDaily = kind === "DAILY";
  const common = {
    page,
    perPage: PER_PAGE,
    search: debouncedSearch || undefined,
    team_id: teamFilter === "ALL" ? undefined : teamFilter,
  };

  const daily = useMissingTimesheets(
    {
      ...common,
      date,
      on_leave: onLeave === "ALL" ? undefined : onLeave === "true",
    },
    isDaily,
  );
  const monthly = useMissingMonthlyReviews(
    { ...common, year, month },
    !isDaily,
  );
  const exportDaily = useExportMissingTimesheets();
  const exportMonthly = useExportMissingMonthlyReviews();

  const query = isDaily ? daily : monthly;
  const rows = (query.data?.data ?? []) as unknown as Data[];
  const pagination = query.data?.pagination;
  const columns = isDaily ? dailyColumns : monthlyColumns;
  const resetPage = () => setPage(1);

  const switchKind = (next: "DAILY" | "MONTHLY") => {
    setKind(next);
    setExportFrom("");
    setExportTo("");
    resetPage();
  };

  const handleExport = () => {
    const team_id = common.team_id;
    if (isDaily) {
      const from = exportFrom || date;
      exportDaily.mutate({ from, to: exportTo || from, team_id });
    } else {
      const from = exportFrom || `${year}-${String(month).padStart(2, "0")}`;
      exportMonthly.mutate({ from, to: exportTo || from, team_id });
    }
  };

  const yearOptions = [
    defaultMonth.year + 1,
    defaultMonth.year,
    defaultMonth.year - 1,
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={isDaily ? "default" : "outline"}
          onClick={() => switchKind("DAILY")}
          className="uppercase text-[10px] tracking-widest"
        >
          Timesheets
        </Button>
        <Button
          type="button"
          size="sm"
          variant={!isDaily ? "default" : "outline"}
          onClick={() => switchKind("MONTHLY")}
          className="uppercase text-[10px] tracking-widest"
        >
          Monthly Reviews
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end gap-4 flex-wrap">
        <div className="relative flex-1 min-w-60 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
          <Input
            placeholder="Search by Name or MUID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
            className={`pl-12 w-full ${inputClass}`}
          />
        </div>

        {isDaily ? (
          <>
            <Input
              type="date"
              aria-label="Date"
              value={date}
              max={today}
              onChange={(e) => {
                setDate(e.target.value || today);
                resetPage();
              }}
              className={`w-full sm:w-44 ${inputClass}`}
            />
            <Select
              value={onLeave}
              onValueChange={(v) => {
                setOnLeave(v as typeof onLeave);
                resetPage();
              }}
            >
              <SelectTrigger className={selectClass}>
                <SelectValue placeholder="Leave" />
              </SelectTrigger>
              <SelectContent position="popper" className="bg-card font-bold">
                <SelectItem value="ALL" className="uppercase text-[10px]">
                  Everyone
                </SelectItem>
                <SelectItem value="false" className="uppercase text-[10px]">
                  Not on leave
                </SelectItem>
                <SelectItem value="true" className="uppercase text-[10px]">
                  On leave
                </SelectItem>
              </SelectContent>
            </Select>
          </>
        ) : (
          <>
            <Select
              value={String(year)}
              onValueChange={(v) => {
                setYear(Number(v));
                resetPage();
              }}
            >
              <SelectTrigger className={selectClass}>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent position="popper" className="bg-card font-bold">
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)} className="text-[10px]">
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(month)}
              onValueChange={(v) => {
                setMonth(Number(v));
                resetPage();
              }}
            >
              <SelectTrigger className={selectClass}>
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent position="popper" className="bg-card font-bold">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <SelectItem
                    key={m}
                    value={String(m)}
                    className="uppercase text-[10px]"
                  >
                    {new Date(2000, m - 1, 1).toLocaleDateString(undefined, {
                      month: "long",
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        <TeamFilterSelect
          value={teamFilter}
          onChange={(v) => {
            setTeamFilter(v);
            resetPage();
          }}
        />
      </div>

      {/* Context line from the server */}
      {daily.data && isDaily && (
        <p className="text-xs text-muted-foreground font-medium">
          {formatDateOnly(daily.data.date)}
          {daily.data.is_weekend && " · Weekend"}
          {daily.data.can_still_submit
            ? " · Interns can still submit for this day"
            : " · Submission window closed"}
        </p>
      )}
      {monthly.data && !isDaily && (
        <p className="text-xs text-muted-foreground font-medium">
          {formatReviewMonth(monthly.data)}
          {monthly.data.window_open
            ? " · Window open, interns can still submit"
            : " · Window closed"}
        </p>
      )}
      {query.error && (
        <p className="text-xs font-bold text-destructive">
          {query.error.message}
        </p>
      )}

      <Table
        rows={rows}
        isLoading={query.isLoading}
        page={page}
        perPage={PER_PAGE}
        columnOrder={columns}
        slNoCellClassName="font-black text-muted-foreground/40 w-16"
      >
        <THead columnOrder={columns} onIconClick={() => {}} action={false} />
        <div className="p-4 border-t border-border/20">
          <Pagination
            currentPage={page}
            totalPages={pagination?.totalPages ?? 1}
            perPage={PER_PAGE}
            totalCount={pagination?.count ?? 0}
            handlePreviousClick={() => setPage((p) => Math.max(1, p - 1))}
            handleNextClick={() =>
              setPage((p) => Math.min(pagination?.totalPages ?? 1, p + 1))
            }
          />
        </div>
      </Table>

      {/* CSV export over a range */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 p-4 rounded-xl border border-border/40 bg-muted/10">
        <div className="space-y-1">
          <Label
            htmlFor="missing-export-from"
            className="text-[10px] font-black uppercase tracking-widest"
          >
            From
          </Label>
          <Input
            id="missing-export-from"
            type={isDaily ? "date" : "month"}
            value={exportFrom}
            max={isDaily ? today : today.slice(0, 7)}
            onChange={(e) => setExportFrom(e.target.value)}
            className={`w-full sm:w-44 ${inputClass}`}
          />
        </div>
        <div className="space-y-1">
          <Label
            htmlFor="missing-export-to"
            className="text-[10px] font-black uppercase tracking-widest"
          >
            To
          </Label>
          <Input
            id="missing-export-to"
            type={isDaily ? "date" : "month"}
            value={exportTo}
            max={isDaily ? today : today.slice(0, 7)}
            onChange={(e) => setExportTo(e.target.value)}
            className={`w-full sm:w-44 ${inputClass}`}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleExport}
          disabled={exportDaily.isPending || exportMonthly.isPending}
          className="h-12 gap-2 uppercase text-[10px] tracking-widest font-black"
        >
          <Download className="w-4 h-4" /> Export CSV
        </Button>
        <p className="text-[10px] text-muted-foreground sm:ml-2">
          {isDaily
            ? "Up to 92 days. Empty range exports the selected date."
            : "Up to 24 months. Empty range exports the selected month."}
        </p>
      </div>
    </div>
  );
}
