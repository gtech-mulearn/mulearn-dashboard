"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  Search,
  Shield,
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
import { type TLeaveRequest, useManageLeaves } from "@/features/intern";
import { LeaveEvaluateDialog } from "./components/leave-evaluate-dialog";

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

  const { data: listData, isLoading } = useManageLeaves({
    page,
    perPage,
    search: searchText || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    sortBy,
    sortOrder,
  });

  const totalPages = listData?.pagination?.totalPages ?? 1;
  const totalCount = listData?.pagination?.count ?? 0;

  const rows = useMemo(() => {
    const data = (listData?.data ?? []) as unknown as TLeaveRequest[];
    const resolved = [...data];
    if (sortBy) {
      resolved.sort((a, b) => {
        let valA = a[sortBy as keyof TLeaveRequest];
        let valB = b[sortBy as keyof TLeaveRequest];

        if (sortBy === "duration_days") {
          valA =
            a.duration_days ?? calculateDurationDays(a.start_date, a.end_date);
          valB =
            b.duration_days ?? calculateDurationDays(b.start_date, b.end_date);
        }

        if (valA === undefined || valA === null) valA = "";
        if (valB === undefined || valB === null) valB = "";

        if (
          sortBy === "start_date" ||
          sortBy === "end_date" ||
          sortBy === "created_at"
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
            ? (valA as unknown as number) - (valB as unknown as number)
            : (valB as unknown as number) - (valA as unknown as number);
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortOrder === "asc" ? -1 : 1;
        if (strA > strB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    return resolved as unknown as Data[];
  }, [listData, sortBy, sortOrder]);

  const columnOrder = [
    {
      column: "user_name",
      Label: "Intern Name",
      isSortable: true,
      wrap: (data: string, _id: string, row: Data) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground uppercase tracking-tight text-sm">
            {String(
              data ||
                (row as unknown as { full_name?: string }).full_name ||
                "Unknown",
            )}
          </span>
          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mt-1">
            {String(row.user_muid || row.muid || "")}
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

  const handleCloseDialog = () => {
    setIsReviewOpen(false);
    setReviewNote("");
    setSelectedLeave(null);
  };

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
              handleNextClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
            />
          </div>
        </Table>
      </div>

      <LeaveEvaluateDialog
        selectedLeave={selectedLeave}
        reviewNote={reviewNote}
        isOpen={isReviewOpen}
        onOpenChange={setIsReviewOpen}
        onReviewNoteChange={setReviewNote}
        onClose={handleCloseDialog}
      />

      <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/20 py-8">
        <Sparkles className="w-3 h-3" /> Evaluation Chamber{" "}
        <Sparkles className="w-3 h-3" />
      </div>
    </div>
  );
}
