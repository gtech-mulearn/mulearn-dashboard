"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { Blank } from "@/components/dashboard/table/Blank";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePendingTasks } from "../../hooks";
import type { TaskVerificationItem } from "../../schemas";
import { TaskReviewDialog } from "./task-review-dialog";

const COLUMN_ORDER = [
  { column: "title", Label: "Title", isSortable: true },
  { column: "hashtag", Label: "Hashtag", isSortable: true },
  { column: "karma", Label: "Karma", isSortable: true },
  { column: "requested_by_name", Label: "Submitter", isSortable: true },
  { column: "submitter_role", Label: "Role", isSortable: true },
  { column: "approval_status", Label: "Status", isSortable: false },
];

export function TaskVerificationTable({
  status,
  role,
}: {
  status: "pending" | "approved" | "rejected";
  role?: "mentor" | "company" | "admin";
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sort, setSort] = useState("");
  const [reviewState, setReviewState] = useState<{
    task: TaskVerificationItem;
    action: "approve" | "reject";
  } | null>(null);

  const { data, isLoading } = usePendingTasks({
    approval_status: status,
    role,
    pageIndex: page,
    perPage,
    search: search.trim() || undefined,
    sortBy: sort || undefined,
  });

  const tasks = data?.tasks || [];
  const pagination = data?.totalPages
    ? { totalPages: data.totalPages, count: data.totalItems }
    : null;

  const handleSort = (column: string) => {
    if (sort === column) {
      setSort(`-${column}`);
    } else if (sort === `-${column}`) {
      setSort("");
    } else {
      setSort(column);
    }
  };

  const tableRows: Data[] = tasks.map((t) => {
    const dataRow: Data = {
      id: t.id,
      title: t.title,
      hashtag: t.hashtag,
      karma: t.karma,
      requested_by_name: t.requested_by?.full_name || t.company_name || "—",
      submitter_role: t.company_name
        ? "Company"
        : t.requested_by
          ? "Mentor"
          : "—",
      approval_status: t.approval_status,
    };
    return dataRow;
  });

  const downloadCSV = () => {
    const headers = [
      "Title",
      "Hashtag",
      "Karma",
      "Submitter",
      "Role",
      "Status",
    ];
    const csvRows = tasks.map((t) => [
      t.title,
      t.hashtag,
      t.karma,
      t.requested_by?.full_name || t.company_name || "—",
      t.company_name ? "Company" : t.requested_by ? "Mentor" : "—",
      t.approval_status,
    ]);
    const csv = [headers, ...csvRows]
      .map((row) =>
        row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `task-verification-${status}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        <TableTop
          onSearchText={(text) => {
            setSearch(text);
            setPage(1);
          }}
          onPerPageNumber={(n) => {
            setPerPage(n);
            setPage(1);
          }}
          CSV={`task-verification-${status}.csv`}
          onCsvDownload={downloadCSV}
          perPage={perPage}
          perPageOptions={[10, 25, 50, 100]}
          searchPlaceholder="Search by Name. Title or Hashtag..."
          searchSize="sm"
          searchPosition="right"
          searchInputClassName="pl-8 bg-background border-border text-foreground focus-visible:ring-ring"
        />

        <Table
          rows={tableRows}
          isloading={isLoading}
          page={page}
          perPage={perPage}
          columnOrder={COLUMN_ORDER}
          id={["id"]}
          customActionRender={(row) => {
            const item = tasks.find((t) => t.id === String(row.id));
            if (!item) return null;
            const isPending = item.approval_status === "pending";
            return (
              <div className="flex items-center gap-1 justify-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-success hover:bg-success/10"
                      onClick={() =>
                        setReviewState({ task: item, action: "approve" })
                      }
                      disabled={!isPending}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-card text-foreground border border-border">
                    {isPending
                      ? "Approve Task"
                      : `Already reviewed: ${item.approval_status}`}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() =>
                        setReviewState({ task: item, action: "reject" })
                      }
                      disabled={!isPending}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-card text-foreground border border-border">
                    Reject Task
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          }}
          customCellRender={(column, row) => {
            const item = tasks.find((t) => t.id === String(row.id));
            if (!item) return null;
            if (column === "approval_status") {
              const statusColors = {
                pending: "text-warning bg-warning/10 border-warning/20",
                approved: "text-success bg-success/10 border-success/20",
                rejected:
                  "text-destructive bg-destructive/10 border-destructive/20",
              };
              return (
                <Badge
                  variant="outline"
                  className={`capitalize px-2 py-0.5 font-medium border ${statusColors[item.approval_status]}`}
                >
                  {item.approval_status}
                </Badge>
              );
            }
            return null;
          }}
        >
          <THead
            columnOrder={COLUMN_ORDER}
            onIconClick={handleSort}
            action={true}
          />
          <div>
            {!isLoading && pagination && (
              <Pagination
                currentPage={page}
                totalPages={pagination.totalPages}
                handleNextClick={() =>
                  setPage((p) => Math.min(p + 1, pagination.totalPages))
                }
                handlePreviousClick={() => setPage((p) => Math.max(p - 1, 1))}
                perPage={perPage}
                totalCount={pagination.count ?? 0}
              />
            )}
          </div>
          <Blank />
        </Table>

        {reviewState && (
          <TaskReviewDialog
            open={!!reviewState}
            onOpenChange={(open) => !open && setReviewState(null)}
            task={reviewState.task}
            action={reviewState.action}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
