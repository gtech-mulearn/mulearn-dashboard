"use client";

import { format } from "date-fns";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuditLogs } from "../hooks/use-achievement-logs";
import type { AuditLog } from "../schemas";

export function AuditLogsTable() {
  const [muid, setMuid] = React.useState("");
  const [activeMuid, setActiveMuid] = React.useState("");

  const { data: logs = [], isLoading } = useAuditLogs(activeMuid);

  const handleSearch = () => {
    if (muid.trim()) setActiveMuid(muid.trim());
  };

  const renderTimestamp = (ts: string | undefined) => {
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Achievement</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log: AuditLog, index: number) => {
                    const meta = log.metadata ?? {};
                    const keys = Object.keys(meta);

                    return (
                      <TableRow key={log.id ?? index}>
                        <TableCell>
                          <Badge variant="secondary">{log.action}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs">
                            {log.achievement_name ??
                              log.achievement_id ??
                              "Unknown"}
                          </span>
                        </TableCell>
                        <TableCell>{renderTimestamp(log.created_at)}</TableCell>
                        <TableCell>
                          {keys.length === 0 ? (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
                          ) : (
                            <div className="max-w-xs truncate text-xs text-muted-foreground">
                              {keys.slice(0, 3).map((k: string) => (
                                <span key={k} className="mr-2">
                                  <span className="font-medium">{k}:</span>{" "}
                                  {String(meta[k]).slice(0, 30)}
                                </span>
                              ))}
                              {keys.length > 3 && (
                                <span>+{keys.length - 3} more</span>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        ))}
    </div>
  );
}
