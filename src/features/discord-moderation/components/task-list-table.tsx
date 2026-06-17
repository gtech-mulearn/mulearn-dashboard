/**
 * Task List Table
 *
 * 📍 src/features/discord-moderation/components/task-list-table.tsx
 *
 * Paginated, searchable, sortable table of karma activity logs.
 * Status column is colour-coded; Discord link column is a clickable anchor.
 */

"use client";

import { ExternalLink } from "lucide-react";
import type { ReactElement } from "react";
import { useState } from "react";
import { DataTableErrorBoundary } from "@/components/dashboard/DataTableErrorBoundary";
import { Blank } from "@/components/dashboard/table/Blank";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { useTaskList } from "../hooks";

// ─── Status badge ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-warning text-primary-foreground border-transparent",
  "Peer Approved": "bg-brand-blue text-primary-foreground border-transparent",
  "Appraiser Approved":
    "bg-brand-purple text-primary-foreground border-transparent",
  "Karma Awarded": "bg-success text-primary-foreground border-transparent",
};

function StatusBadge({ status }: { status: string }): ReactElement {
  const styles =
    STATUS_STYLES[status] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles}`}
    >
      {status}
    </span>
  );
}

function DiscordLink({ href }: { href: string }): ReactElement {
  if (!href || href === "-") {
    return <span className="text-muted-foreground text-xs">—</span>;
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline text-sm"
    >
      <ExternalLink className="size-3.5 shrink-0" />
      View
    </a>
  );
}

// ─── Column definitions ───────────────────────────────────────────────────────
// Typed against Table's columnOrder prop — no casts needed.

type ColumnDef = {
  column: string;
  Label: string;
  isSortable: boolean;
  width?: string;
  wrap?: (data: string | ReactElement, id: string, row: Data) => ReactElement;
};

const COLUMN_ORDER: ColumnDef[] = [
  { column: "full_name", Label: "User", isSortable: false, width: "w-1/5" },
  { column: "task_name", Label: "Task", isSortable: false, width: "w-1/5" },
  {
    column: "status",
    Label: "Status",
    isSortable: false,
    width: "w-1/5",
    wrap: (data) => <StatusBadge status={String(data)} />,
  },
  {
    column: "discordlink",
    Label: "Discord",
    isSortable: false,
    width: "w-1/5",
    wrap: (data) => <DiscordLink href={data == null ? "" : String(data)} />,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function TaskListTable() {
  return (
    <DataTableErrorBoundary>
      <TaskListTableContent />
    </DataTableErrorBoundary>
  );
}

function TaskListTableContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");

  // Search is handled client-side; the backend endpoint does not support it.
  const { data, isLoading } = useTaskList({
    pageIndex: currentPage,
    perPage,
    sortBy,
  });

  const allRows = (data?.data ?? []) as unknown as Data[];

  const rows = search.trim()
    ? allRows.filter((row) =>
        Object.values(row).some((val) =>
          String(val ?? "")
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
        ),
      )
    : allRows;

  const totalPages = data?.pagination?.totalPages ?? 1;
  const totalCount = data?.pagination?.total ?? 0;

  function handleSearch(value: string) {
    setSearch(value);
  }

  function handlePerPageChange(value: number) {
    setPerPage(value);
    setCurrentPage(1);
  }

  function handleSortChange(column: string) {
    setSortBy((prev) => (prev === column ? `-${column}` : column));
    setCurrentPage(1);
  }

  return (
    <>
      <TableTop
        onSearchText={handleSearch}
        onPerPageNumber={handlePerPageChange}
        perPage={perPage}
        perPageOptions={[5, 10, 20, 50]}
        CSV=""
        searchPlaceholder="Search by user, task, status, or link…"
        searchSize="md"
        searchPosition="right"
      />
      <Table
        rows={rows}
        isLoading={isLoading}
        page={currentPage}
        perPage={perPage}
        columnOrder={COLUMN_ORDER}
        id={[]}
      >
        <THead
          columnOrder={COLUMN_ORDER}
          onIconClick={handleSortChange}
          action={false}
          thClassName="text-xl"
          slNoClassName="w-1/5"
        />
        <div>
          {!isLoading && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              handleNextClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              handlePreviousClick={() =>
                setCurrentPage((p) => Math.max(p - 1, 1))
              }
              perPage={perPage}
              totalCount={totalCount}
            />
          )}
        </div>
        <Blank />
      </Table>
    </>
  );
}
