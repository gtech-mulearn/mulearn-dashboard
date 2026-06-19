/**
 * Error Log Page Component
 *
 * 📍 src/features/error-log/components/error-log-page.tsx
 *
 * Admin-only page for viewing, downloading, and managing system error logs.
 *
 * Features:
 *  - Toolbar: 3 log type groups (Error, Root, Request),
 *    each with Download + Clear buttons
 *  - Table: displays all log entries with search + pagination
 *  - Row-level Dismiss / Delete action (via Table's built-in modal)
 *
 * Architecture rules enforced:
 *  - No react-select, no react-hot-toast, no any types
 *  - Log type buttons rendered by mapping over LOG_TYPES (DRY)
 *  - Toasts only in mutation onSuccess/onError (in hook files)
 */

"use client";

import { AlertTriangle, Download, FileText, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Blank } from "@/components/dashboard/table/Blank";
import Pagination from "@/components/dashboard/table/pagination";
import Table from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Button } from "@/components/ui/button";
import {
  useClearLog,
  useDismissLogEntry,
  useDownloadLogFile,
  useErrorLog,
} from "../hooks";
import type { ErrorLogEntry, LogType } from "../schemas";

// ============================================
// Constants
// ============================================

const LOG_TYPES: { type: LogType; label: string }[] = [
  { type: "error", label: "Error" },
  { type: "root", label: "Root" },
  { type: "request", label: "Request" },
];

const COLUMN_ORDER = [
  { column: "type", Label: "Type", isSortable: false, width: "w-32" },
  {
    column: "message",
    Label: "Message",
    isSortable: false,
    width: "w-[500px]",
  },
  { column: "method", Label: "Method", isSortable: false, width: "w-24" },
  { column: "path", Label: "Path", isSortable: false, width: "w-80" },
  { column: "timestamp", Label: "Timestamp", isSortable: false, width: "w-48" },
  { column: "muid", Label: "MUID", isSortable: false, width: "w-64" },
];

// ============================================
// Main Component
// ============================================

export function ErrorLogPage() {
  const { data: rows = [], isLoading } = useErrorLog();
  const { mutate: downloadLog, isPending: isDownloading } =
    useDownloadLogFile();
  const { mutate: clearLog, isPending: isClearing } = useClearLog();
  const { mutate: dismissEntry } = useDismissLogEntry();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  // Client-side search — no server-side pagination (API returns all)
  const filtered = useMemo(
    () =>
      rows.filter(
        (r: ErrorLogEntry) =>
          r.type.toLowerCase().includes(search.toLowerCase()) ||
          r.message.toLowerCase().includes(search.toLowerCase()) ||
          r.method.toLowerCase().includes(search.toLowerCase()) ||
          r.path.toLowerCase().includes(search.toLowerCase()) ||
          r.muid.toLowerCase().includes(search.toLowerCase()),
      ),
    [rows, search],
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const pageSlice = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = (id: string | undefined) => {
    if (id) dismissEntry(id);
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* ── Page header ─────────────────────────────────────── */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          System Error Log
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View, download, and clear backend error logs. Delete individual
          entries to keep your log clean.
        </p>
      </div>

      {/* ── Log type action toolbar ──────────────────────────── */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        {LOG_TYPES.map(({ type, label }) => (
          <div
            key={type}
            className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2"
          >
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-[52px] text-sm font-semibold text-foreground">
              {label}
            </span>
            <div className="flex gap-1.5">
              {/* Download button */}
              <Button
                id={`error-log-download-${type}`}
                variant="default"
                size="sm"
                disabled={isDownloading}
                onClick={() => downloadLog(type)}
                aria-label={`Download ${label} log`}
              >
                <Download />
                Download
              </Button>
              {/* Clear button */}
              <Button
                id={`error-log-clear-${type}`}
                variant="destructive"
                size="sm"
                disabled={isClearing}
                onClick={() => clearLog(type)}
                aria-label={`Clear ${label} log`}
              >
                <Trash2 />
                Clear {label}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search + per-page control ────────────────────────── */}
      <TableTop
        onSearchText={(text) => {
          setSearch(text);
          setPage(1);
        }}
        onPerPageNumber={(n) => {
          setPerPage(n);
          setPage(1);
        }}
        CSV=""
        perPage={perPage}
        perPageOptions={[10, 25, 50, 100]}
        searchPlaceholder="Search by type, message, method, path, or MUID…"
        searchSize="sm"
        searchPosition="right"
      />

      {/* ── Log entries table ────────────────────────────────── */}
      <Table
        rows={pageSlice}
        isLoading={isLoading}
        page={page}
        perPage={perPage}
        columnOrder={COLUMN_ORDER}
        id={["id"]}
        onDeleteClick={handleDelete}
        modalDeleteHeading="Dismiss Log Entry"
        modalDeleteContent="Are you sure you want to dismiss this log entry? This cannot be undone."
        modalTypeContent="error"
      >
        <THead columnOrder={COLUMN_ORDER} onIconClick={() => {}} action />
        <div>
          {!isLoading && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              handleNextClick={() =>
                setPage((p) => Math.min(p + 1, totalPages || 1))
              }
              handlePreviousClick={() => setPage((p) => Math.max(p - 1, 1))}
              perPage={perPage}
              totalCount={filtered.length}
            />
          )}
        </div>
        <Blank />
      </Table>
    </div>
  );
}
