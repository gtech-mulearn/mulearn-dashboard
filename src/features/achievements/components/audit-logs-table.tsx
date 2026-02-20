"use client";

import type { ColumnDef, Row } from "@tanstack/react-table";
import { format } from "date-fns";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { AuditLog } from "../schemas";
import { useAuditLogs } from "../hooks/use-achievement-logs";

const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }: { row: Row<AuditLog> }) => (
      <Badge variant="secondary">{row.original.action}</Badge>
    ),
  },
  {
    accessorKey: "user_id",
    header: "User ID",
    cell: ({ row }: { row: Row<AuditLog> }) => (
      <span className="font-mono text-xs">{row.original.user_id}</span>
    ),
  },
  {
    accessorKey: "timestamp",
    header: "Timestamp",
    cell: ({ row }: { row: Row<AuditLog> }) => {
      const ts = row.original.timestamp;
      if (!ts) return <span className="text-sm text-muted-foreground">—</span>;
      try {
        return (
          <span className="text-sm text-muted-foreground">
            {format(new Date(ts), "dd MMM yyyy, HH:mm:ss")}
          </span>
        );
      } catch {
        return <span className="text-sm text-muted-foreground">—</span>;
      }
    },
  },
  {
    id: "metadata",
    header: "Details",
    cell: ({ row }: { row: Row<AuditLog> }) => {
      const meta = row.original.metadata ?? {};
      const keys = Object.keys(meta);
      if (keys.length === 0)
        return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <div className="max-w-xs truncate text-xs text-muted-foreground">
          {keys.slice(0, 3).map((k) => (
            <span key={k} className="mr-2">
              <span className="font-medium">{k}:</span>{" "}
              {String(meta[k]).slice(0, 30)}
            </span>
          ))}
          {keys.length > 3 && <span>+{keys.length - 3} more</span>}
        </div>
      );
    },
    enableSorting: false,
  },
];

export function AuditLogsTable() {
  const [muid, setMuid] = React.useState("");
  const [activeMuid, setActiveMuid] = React.useState("");

  const { data: logs = [], isLoading } = useAuditLogs(activeMuid);

  const handleSearch = () => {
    if (muid.trim()) setActiveMuid(muid.trim());
  };

  return (
    <div className="space-y-6" data-testid="audit-logs-table">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
        <p className="text-sm text-muted-foreground">
          View the achievement audit trail for any user.
        </p>
      </div>

      {/* MUID search */}
      <div className="flex gap-2 max-w-sm">
        <Input
          placeholder="Enter MUID to search..."
          value={muid}
          onChange={(e) => setMuid(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          data-testid="audit-muid-input"
        />
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          onClick={handleSearch}
          disabled={!muid.trim() || isLoading}
          data-testid="audit-search-btn"
        >
          {isLoading ? "Loading..." : "Search"}
        </button>
      </div>

      {activeMuid &&
        (isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons are static
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={logs}
            searchKey="action"
            searchPlaceholder="Filter by action..."
            isLoading={false}
          />
        ))}
    </div>
  );
}
