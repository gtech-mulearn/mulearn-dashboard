"use client";

import { format } from "date-fns";
import {
  AlertCircle,
  Building2,
  Calendar,
  ExternalLink,
  Eye,
  GraduationCap,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Blank } from "@/components/dashboard/table/Blank";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUnverifiedOrgLinks, useUpdateOrgLinkVerification } from "../hooks";
import type { UnverifiedOrgLinkUser } from "../types";

const COLUMN_ORDER = [
  { column: "full_name", Label: "Full Name", isSortable: true },
  { column: "muid", Label: "MuID", isSortable: true },
  { column: "email", Label: "Email", isSortable: true },
  { column: "mobile", Label: "Mobile", isSortable: false },
  { column: "org_title", Label: "Organization", isSortable: true },
  { column: "graduation_year", Label: "Graduation Year", isSortable: false },
  { column: "created_at", Label: "Requested Date", isSortable: true },
  { column: "verified", Label: "Status", isSortable: false },
];

export function UnverifiedOrgLinksTable() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [viewingUser, setViewingUser] = useState<UnverifiedOrgLinkUser | null>(
    null,
  );

  const lastViewedUser = useRef<UnverifiedOrgLinkUser | null>(null);
  if (viewingUser) lastViewedUser.current = viewingUser;

  const { data, isLoading, isError, error, refetch } = useUnverifiedOrgLinks({
    page,
    perPage,
    search: search.trim() || undefined,
    sortBy,
    sortOrder,
  });

  const updateVerificationMutation = useUpdateOrgLinkVerification();

  const rows = data?.data || [];
  const pagination = data?.pagination;

  const tableRows: (Data & UnverifiedOrgLinkUser)[] = useMemo(() => {
    const list = rows.map((row) => ({
      ...row,
      mobile: row.mobile || "-",
    }));

    if (!sortBy) return list;

    return [...list].sort((a, b) => {
      const valA = a[sortBy as keyof UnverifiedOrgLinkUser];
      const valB = b[sortBy as keyof UnverifiedOrgLinkUser];

      if (valA === valB) return 0;
      if (valA == null || valA === "-" || valA === "") return 1;
      if (valB == null || valB === "-" || valB === "") return -1;

      let comparison = 0;
      if (typeof valA === "number" && typeof valB === "number") {
        comparison = valA - valB;
      } else if (typeof valA === "boolean" && typeof valB === "boolean") {
        comparison = (valA ? 1 : 0) - (valB ? 1 : 0);
      } else if (sortBy === "created_at") {
        const timeA = new Date(String(valA)).getTime();
        const timeB = new Date(String(valB)).getTime();
        if (!Number.isNaN(timeA) && !Number.isNaN(timeB)) {
          comparison = timeA - timeB;
        } else {
          comparison = String(valA).localeCompare(String(valB));
        }
      } else {
        comparison = String(valA).localeCompare(String(valB), undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });
  }, [rows, sortBy, sortOrder]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      if (Number.isNaN(date.getTime())) return dateStr;
      return format(date, "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and overview info */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground">
            Unverified Organization Links
          </h3>
          <p className="text-xs text-muted-foreground">
            Review and verify student and member affiliation requests for your
            campus.
          </p>
        </div>
        {pagination && pagination.count > 0 && (
          <div className="flex items-center gap-2">
            <Badge
              variant="warning"
              className="cursor-default text-xs font-bold"
            >
              {pagination.count} Pending{" "}
              {pagination.count === 1 ? "Request" : "Requests"}
            </Badge>
          </div>
        )}
      </div>

      {/* Error state alert */}
      {isError && (
        <Card className="border-destructive/30 bg-destructive/5 text-destructive">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1 text-xs">
              <p className="font-bold">Failed to load affiliation requests</p>
              <p className="text-destructive/90 mt-0.5">
                {error instanceof Error
                  ? error.message
                  : "Unable to retrieve unverified organization link users. Please ensure you have verified campus permissions."}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table search & pagination bar */}
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
        searchPlaceholder="Search Name, MuID, Email, Org..."
        searchSize="sm"
        searchPosition="right"
      />

      {/* Reusable Dashboard Table */}
      <Table
        rows={tableRows}
        isLoading={isLoading}
        page={page}
        perPage={perPage}
        columnOrder={COLUMN_ORDER}
        id={["id"]}
        customActionRender={(row) => {
          const item = row as unknown as UnverifiedOrgLinkUser;
          return (
            <div className="flex items-center justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
                title={`View details for ${item.full_name}`}
                aria-label={`View details for ${item.full_name}`}
                onClick={() => setViewingUser(item)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          );
        }}
        customCellRender={(column, row) => {
          const item = row as unknown as UnverifiedOrgLinkUser;
          switch (column) {
            case "full_name":
              return (
                <Link
                  href={`/profile/${item.muid}`}
                  className="group inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
                >
                  {item.full_name}
                  <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                </Link>
              );
            case "muid":
              return (
                <span className="font-mono text-xs font-medium text-muted-foreground">
                  {item.muid}
                </span>
              );
            case "email":
              return (
                <span className="text-xs text-foreground/90 font-medium">
                  {item.email}
                </span>
              );
            case "mobile":
              return (
                <span className="text-xs text-muted-foreground">
                  {item.mobile || "-"}
                </span>
              );
            case "org_title":
              return (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-foreground">
                    {item.org_title}
                  </span>
                  {item.org_type && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                      {item.org_type}
                    </span>
                  )}
                </div>
              );
            case "graduation_year":
              return (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    {item.graduation_year || "-"}
                  </span>
                  <Badge
                    variant={item.is_alumni ? "secondary" : "outline"}
                    className="px-1.5 py-0 text-[10px] font-semibold"
                  >
                    {item.is_alumni ? "Alumni" : "Student"}
                  </Badge>
                </div>
              );
            case "created_at":
              return (
                <span className="text-xs text-muted-foreground">
                  {formatDate(item.created_at)}
                </span>
              );
            case "verified":
              return (
                <Badge variant="warning" className="cursor-default text-[10px]">
                  Pending
                </Badge>
              );
            default:
              return null;
          }
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
              totalCount={pagination.count}
            />
          )}
        </div>

        <Blank />
      </Table>

      {/* Details Dialog */}
      <Dialog
        open={viewingUser !== null}
        onOpenChange={(open) => {
          if (!open) setViewingUser(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  User Affiliation Details
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Detailed view of the organization link request
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-3 py-2 text-xs">
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground">
                  {lastViewedUser.current?.full_name}
                </span>
                <Badge variant="warning" className="text-[10px]">
                  Pending Verification
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground font-mono">
                <span>MUID:</span>
                <span className="font-bold text-foreground">
                  {lastViewedUser.current?.muid}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="rounded-lg border border-border/50 bg-card p-2.5">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="font-medium text-[11px]">Email</span>
                </div>
                <p className="font-semibold text-foreground truncate">
                  {lastViewedUser.current?.email || "-"}
                </p>
              </div>

              <div className="rounded-lg border border-border/50 bg-card p-2.5">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Phone className="h-3.5 w-3.5" />
                  <span className="font-medium text-[11px]">Mobile</span>
                </div>
                <p className="font-semibold text-foreground">
                  {lastViewedUser.current?.mobile || "-"}
                </p>
              </div>

              <div className="rounded-lg border border-border/50 bg-card p-2.5">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Building2 className="h-3.5 w-3.5" />
                  <span className="font-medium text-[11px]">Organization</span>
                </div>
                <p className="font-semibold text-foreground truncate">
                  {lastViewedUser.current?.org_title || "-"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {lastViewedUser.current?.org_type || "College"}
                </p>
              </div>

              <div className="rounded-lg border border-border/50 bg-card p-2.5">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span className="font-medium text-[11px]">Academics</span>
                </div>
                <p className="font-semibold text-foreground">
                  Year: {lastViewedUser.current?.graduation_year || "-"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Status:{" "}
                  {lastViewedUser.current?.is_alumni
                    ? "Alumni"
                    : "Active Student"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Requested On:</span>
              </div>
              <span className="font-semibold text-foreground">
                {formatDate(lastViewedUser.current?.created_at)}
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewingUser(null)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 text-primary-foreground"
              disabled={updateVerificationMutation.isPending}
              onClick={() => {
                const userToVerify = lastViewedUser.current;
                setViewingUser(null);
                if (userToVerify) {
                  updateVerificationMutation.mutate({
                    linkId: userToVerify.id,
                    verified: true,
                  });
                }
              }}
            >
              <ShieldCheck className="h-4 w-4" />
              {updateVerificationMutation.isPending
                ? "Verifying..."
                : "Verify This Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
