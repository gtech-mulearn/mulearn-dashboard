"use client";

import { format } from "date-fns";
import {
  Award,
  CheckCircle,
  ClipboardList,
  Loader2,
  Search,
  Users,
  X,
  XCircle,
} from "lucide-react";
import * as React from "react";
import Pagination from "@/components/dashboard/table/pagination";
import TableTop from "@/components/dashboard/table/TableTop";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSearch } from "@/hooks/use-search";
import { useAuditLogs, useIssuedLogs } from "../hooks/use-achievement-logs";
import type { AuditLog, IssuedLog } from "../schemas";

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function AuditLogsTable() {
  const [activeMuid, setActiveMuid] = React.useState("");
  const [selectedUser, setSelectedUser] = React.useState<{
    muid: string;
    name: string;
    profile_pic?: string | null;
  } | null>(null);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const {
    results: searchResults,
    isLoading: isSearching,
    handleSearch,
    clearResults,
  } = useSearch();

  // Pagination and search states for global issued logs
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(20);
  const [globalSearch, setGlobalSearch] = React.useState("");
  const [debouncedGlobalSearch, setDebouncedGlobalSearch] = React.useState("");

  // Debounce global logs search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedGlobalSearch(globalSearch);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [globalSearch]);

  // Reset pagination when mode swaps
  // biome-ignore lint/correctness/useExhaustiveDependencies: activeMuid is the intentional trigger; setPage is a stable setter
  React.useEffect(() => {
    setPage(1);
  }, [activeMuid]);

  // Audit logs for selected user (flat array)
  const { data: auditLogs = [], isLoading: isAuditLoading } =
    useAuditLogs(activeMuid);

  // Global issued logs when no user selected (paginated)
  const { data: globalLogsData, isLoading: isGlobalLoading } = useIssuedLogs(
    page,
    perPage,
    debouncedGlobalSearch,
  );

  const isUserSelected = Boolean(activeMuid);
  const globalLogs = globalLogsData?.data || [];
  const pagination = globalLogsData?.pagination;
  const logs = isUserSelected ? auditLogs : globalLogs;
  const isLoading = isUserSelected ? isAuditLoading : isGlobalLoading;

  // Stats calculation
  const totalLogs = isUserSelected
    ? auditLogs.length
    : (pagination?.total ?? 0);
  const issuedOrUniqueRecipientsCount = isUserSelected
    ? auditLogs.filter((l) => l.action?.toLowerCase() === "issue").length
    : new Set(globalLogs.map((l) => l.muid).filter(Boolean)).size;

  const revokedOrUniqueAchievementsCount = isUserSelected
    ? auditLogs.filter((l) => l.action?.toLowerCase() === "revoke").length
    : new Set(globalLogs.map((l) => l.achievement_name).filter(Boolean)).size;

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
          {isUserSelected
            ? `View the achievement audit trail for ${selectedUser?.name}.`
            : "Overview of system achievement logs."}
        </p>
      </div>

      {/* User Search */}
      <div className="max-w-md space-y-2">
        <Label>Search User</Label>
        {!selectedUser ? (
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
                setSearchOpen(e.target.value.length >= 2);
              }}
              onFocus={() => {
                if (searchQuery.length >= 2) setSearchOpen(true);
              }}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              placeholder="Search user by MuID to view audit trail..."
              className="pl-11 h-11 bg-background/50 border-border/50 font-medium rounded-xl focus-visible:ring-brand-blue transition-all duration-200"
            />
            {searchOpen && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-md">
                {isSearching && (
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" /> Searching…
                  </div>
                )}
                {!isSearching && searchResults.length === 0 && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    No users found.
                  </p>
                )}
                {!isSearching &&
                  searchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSelectedUser({
                          muid: user.muid,
                          name: user.full_name,
                          profile_pic: user.profile_pic,
                        });
                        setActiveMuid(user.muid);
                        setSearchQuery("");
                        clearResults();
                        setSearchOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted/60 transition-colors"
                    >
                      <Avatar className="size-8 shrink-0">
                        <AvatarImage src={user.profile_pic ?? undefined} />
                        <AvatarFallback>
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {user.full_name}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {user.muid}
                        </p>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
            <Avatar className="size-9 shrink-0">
              <AvatarImage src={selectedUser.profile_pic ?? undefined} />
              <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {selectedUser.name}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {selectedUser.muid}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => {
                setSelectedUser(null);
                setActiveMuid("");
                setSearchQuery("");
              }}
            >
              <X className="size-4" />
              <span className="sr-only">Clear user selection</span>
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons are static
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Total Logs */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isUserSelected ? "Total Actions" : "Total Issued Logs"}
                  </p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                    {totalLogs}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                  <ClipboardList className="size-6" />
                </div>
              </div>
            </div>

            {/* Middle Card: Issued / Page Unique Recipients */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isUserSelected ? "Issued" : "Page Unique Recipients"}
                  </p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                    {issuedOrUniqueRecipientsCount}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
                  {isUserSelected ? (
                    <CheckCircle className="size-6" />
                  ) : (
                    <Users className="size-6" />
                  )}
                </div>
              </div>
            </div>

            {/* Right Card: Revoked / Unique Achievements */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isUserSelected ? "Revoked" : "Page Unique Achievements"}
                  </p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                    {revokedOrUniqueAchievementsCount}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  {isUserSelected ? (
                    <XCircle className="size-6" />
                  ) : (
                    <Award className="size-6" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* List Section Header */}
          <div className="border-b pb-3">
            <h3 className="text-lg font-semibold text-foreground">
              {isUserSelected ? "Audit" : "Recent Issued Achievements"}
            </h3>
          </div>

          {/* TableTop: Filter / Rows selection when no user is selected */}
          {!isUserSelected && (
            <TableTop
              onSearchText={(text) => setGlobalSearch(text)}
              onPerPageNumber={(val) => {
                setPerPage(val);
                setPage(1);
              }}
              CSV=""
              perPage={perPage}
              perPageOptions={[10, 20, 50, 100]}
              searchPlaceholder="Search logs by MuID, name, or achievement..."
              searchSize="md"
              searchPosition="left"
            />
          )}

          <div className="rounded-2xl border overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-16">Sl.no</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Achievement</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                ) : (
                  [...logs]
                    .sort(
                      (a, b) =>
                        new Date(b.created_at || 0).getTime() -
                        new Date(a.created_at || 0).getTime(),
                    )
                    .map((log: AuditLog | IssuedLog, index: number) => {
                      const absoluteIndex =
                        !isUserSelected && pagination
                          ? (page - 1) * perPage + index + 1
                          : index + 1;

                      if (isUserSelected) {
                        // Audit Log view
                        const auditLog = log as AuditLog;
                        const meta = auditLog.metadata ?? {};
                        const keys = Object.keys(meta);

                        return (
                          <TableRow key={auditLog.id ?? index}>
                            <TableCell className="font-medium">
                              {absoluteIndex}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  auditLog.action?.toLowerCase() === "issue"
                                    ? "bg-success/10 text-success border-success/20"
                                    : "bg-destructive/10 text-destructive border-destructive/20"
                                }
                              >
                                {auditLog.action}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-xs">
                                {auditLog.achievement_name ??
                                  auditLog.achievement_id ??
                                  "Unknown"}
                              </span>
                            </TableCell>
                            <TableCell>
                              {renderTimestamp(auditLog.created_at)}
                            </TableCell>
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
                      }

                      // Global Issued Log view (no user selected)
                      const issuedLog = log as IssuedLog;
                      return (
                        <TableRow key={issuedLog.id ?? index}>
                          <TableCell className="font-medium">
                            {absoluteIndex}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-success/10 text-success border-success/20"
                            >
                              Issued
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs">
                              {issuedLog.achievement_name || "Unknown"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {renderTimestamp(issuedLog.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate text-xs text-muted-foreground flex flex-col gap-0.5">
                              <span>
                                <span className="font-medium">Issued To:</span>{" "}
                                {issuedLog.user_name || "—"} (
                                {issuedLog.muid || "—"})
                              </span>
                              <span>
                                <span className="font-medium">Issued by:</span>{" "}
                                {issuedLog.issued_by || "—"}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls when in global view */}
          {!isUserSelected && pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              perPage={perPage}
              totalCount={pagination.total}
              currentPageCount={globalLogs.length}
              handlePreviousClick={() => setPage((p) => Math.max(p - 1, 1))}
              handleNextClick={() =>
                setPage((p) => Math.min(p + 1, pagination.totalPages))
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
