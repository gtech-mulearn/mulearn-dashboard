"use client";

import { format } from "date-fns";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import {
  ISSUED_LOGS_HEADERS,
  ISSUED_LOGS_PAGE_SIZE,
} from "../constants/constants";
import { useIssuedLogs } from "../hooks/use-achievement-logs";
import type { IssuedLog } from "../schemas";
import { BulkIssueDialog } from "./bulk-issue-dialog";

export function IssuedLogsTable() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 400);

  // Reset page when search input changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset page when search changes
  React.useEffect(() => {
    setPage(1);
  }, [search]);

  const { data, isLoading, isFetching } = useIssuedLogs(
    page,
    ISSUED_LOGS_PAGE_SIZE,
    debouncedSearch,
  );

  const rows = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;
  const total = data?.pagination.total ?? 0;

  return (
    <div className="space-y-4" data-testid="issued-logs-table">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Issued Logs</h2>
          <p className="text-sm text-muted-foreground">
            Full history of issued achievements.
          </p>
        </div>
        <BulkIssueDialog />
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Search by MUID or user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="issued-logs-search"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr>
              {ISSUED_LOGS_HEADERS.map((h: string) => (
                <th
                  key={h}
                  className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons are static
                <tr key={i} className="border-b">
                  {ISSUED_LOGS_HEADERS.map((h: string) => (
                    <td key={h} className="p-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length > 0 ? (
              rows.map((row: IssuedLog, i: number) => (
                <tr
                  key={row.id ?? i}
                  className="border-b transition-colors hover:bg-muted/50"
                  data-testid="issued-log-row"
                >
                  <td className="p-4">
                    <span className="font-mono text-xs">{row.muid}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-medium">{row.user_name}</span>
                  </td>
                  <td className="p-4">{row.achievement}</td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {row.issued_by}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {(() => {
                        if (!row.issued_on) return "—";
                        try {
                          return format(
                            new Date(row.issued_on),
                            "dd MMM yyyy, HH:mm",
                          );
                        } catch {
                          return "—";
                        }
                      })()}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={ISSUED_LOGS_HEADERS.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No issued logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Server-side pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} total record{total !== 1 ? "s" : ""}
          {isFetching && !isLoading && " · updating..."}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
            data-testid="issued-logs-prev"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages || isLoading}
            data-testid="issued-logs-next"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
