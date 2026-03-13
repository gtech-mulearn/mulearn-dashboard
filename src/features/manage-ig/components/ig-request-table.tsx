"use client";

import { Check, X, Clock, AlertCircle, Plus, Loader2, Ban } from "lucide-react";
import { useState } from "react";
import Table from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import Pagination from "@/components/dashboard/table/pagination";
import THead from "@/components/dashboard/table/Thead";
import { useIGRequests } from "../hooks/use-ig-requests";
import type { Data } from "@/components/dashboard/table/Table";

import { DataTableErrorBoundary } from "@/components/dashboard/DataTableErrorBoundary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function IGRequestTable() {
  const {
    requests,
    isLoading,
    page,
    perPage,
    totalCount,
    setPage,
    setPerPage,
    setSearch,
    status,
    setStatus,
    setSortBy,
    updateStatus,
    submitRequest,
    isSubmitting,
  } = useIGRequests();

  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    name: "",
    code: "",
    category: "coder",
    icon: "",
  });

  const handleSortChange = (column: string) => {
    setPage(1);
    setSortBy((prev) => (prev === column ? `-${column}` : column));
  };

  const columnOrder = [
    { column: "ig_name", Label: "IG Name", isSortable: true },
    { column: "user_full_name", Label: "Requested By", isSortable: true },
    { column: "status", Label: "Status", isSortable: true },
    { column: "created_at", Label: "Requested On", isSortable: true },
  ];

  const customCellRender = (column: string, row: Data) => {
    if (column === "status") {
      const status = String(row.status || "cancelled");
      const config: Record<string, { icon: typeof Check; className: string }> =
        {
          active: {
            icon: Check,
            className:
              "bg-chart-2/15 text-chart-2 border-chart-2/30 dark:bg-chart-2/20 dark:text-chart-2",
          },
          requested: {
            icon: Clock,
            className:
              "bg-chart-4/15 text-chart-4 border-chart-4/30 dark:bg-chart-4/20 dark:text-chart-4",
          },
          rejected: {
            icon: X,
            className:
              "bg-destructive/12 text-destructive border-destructive/30 dark:bg-destructive/20 dark:text-destructive",
          },
          cancelled: {
            icon: AlertCircle,
            className:
              "bg-muted text-muted-foreground border-border dark:bg-muted/60",
          },
        };
      const cfg = config[String(status)] || config.cancelled;
      const StatusIcon = cfg.icon;
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${cfg.className}`}
        >
          <StatusIcon className="size-3" />
          {status}
        </span>
      );
    }
    if (column === "ig_name") {
      const igName =
        (
          row as {
            ig_name?: string;
            name?: string;
            interestGroup?: { name?: string };
          }
        ).ig_name ||
        (row as { name?: string }).name ||
        (row as { interestGroup?: { name?: string } }).interestGroup?.name ||
        "";
      return <span className="font-medium">{igName}</span>;
    }
    if (column === "user_full_name") {
      const requester =
        (
          row as {
            user_full_name?: string;
            created_by?: string;
            updated_by?: string;
          }
        ).user_full_name ||
        (row as { created_by?: string }).created_by ||
        (row as { updated_by?: string }).updated_by ||
        "-";
      return <span className="text-sm">{requester}</span>;
    }
    if (column === "created_at") {
      const dateStr = String(row.created_at || "");
      if (!dateStr) return <span className="text-muted-foreground">—</span>;
      try {
        return (
          <span className="text-sm tabular-nums">
            {new Date(dateStr).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        );
      } catch {
        return <span className="text-sm">{dateStr}</span>;
      }
    }
    return null;
  };

  const customActionRender = (row: Data) => {
    if (row.status !== "requested") {
      return (
        <span className="text-xs text-muted-foreground italic">No actions</span>
      );
    }

    return (
      <TooltipProvider delayDuration={200}>
        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2.5 text-primary border-primary/30 hover:bg-primary/10 hover:text-primary dark:text-primary dark:border-primary/40 dark:hover:bg-primary/15"
                onClick={() => updateStatus(String(row.id), "active")}
              >
                <Check className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Approve Request</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive dark:text-destructive dark:border-destructive/40 dark:hover:bg-destructive/15"
                onClick={() => updateStatus(String(row.id), "rejected")}
              >
                <X className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reject Request</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2.5 text-muted-foreground border-border hover:bg-muted/40 hover:text-foreground"
                onClick={() => updateStatus(String(row.id), "cancelled")}
              >
                <Ban className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Cancel Request</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  };

  const handleSubmitRequest = async () => {
    if (
      !requestForm.name.trim() ||
      !requestForm.code.trim() ||
      !requestForm.icon.trim()
    )
      return;
    try {
      await submitRequest(requestForm);
      setIsRequestDialogOpen(false);
      setRequestForm({ name: "", code: "", category: "coder", icon: "" });
    } catch {
      // Error toast handled by the hook
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">IG Requests</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review and manage interest group creation requests.
          </p>
        </div>
        <Button onClick={() => setIsRequestDialogOpen(true)}>
          <Plus className="mr-2 size-4" /> Submit Request
        </Button>
      </div>

      <TableTop
        onSearchText={setSearch}
        onPerPageNumber={setPerPage}
        CSV=""
        perPage={perPage}
        perPageOptions={[10, 25, 50]}
        searchPlaceholder="Search Requests..."
        searchSize="md"
        searchPosition="right"
      />

      <div className="flex flex-wrap items-center gap-3">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Status
        </Label>
        <Select
          value={status || "all"}
          onValueChange={(val) => setStatus(val === "all" ? "" : val)}
        >
          <SelectTrigger className="h-8 w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="requested">Requested</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTableErrorBoundary>
        <Table
          rows={requests as unknown as Data[]}
          isloading={isLoading}
          page={page}
          perPage={perPage}
          columnOrder={columnOrder}
          id={["id"]}
          customCellRender={customCellRender}
          customActionRender={customActionRender}
        >
          <THead
            columnOrder={columnOrder}
            onIconClick={handleSortChange}
            action={true}
          />
          <div className="p-4">
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(totalCount / perPage)}
              perPage={perPage}
              totalCount={totalCount}
              handlePreviousClick={() => setPage((p) => Math.max(1, p - 1))}
              handleNextClick={() =>
                setPage((p) => Math.min(Math.ceil(totalCount / perPage), p + 1))
              }
            />
          </div>
        </Table>
      </DataTableErrorBoundary>

      {/* Submit IG Request Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit IG Request</DialogTitle>
            <DialogDescription>
              Request a new interest group. An admin will review and approve or
              reject it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="req-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="req-name"
                placeholder="e.g. Machine Learning"
                value={requestForm.name}
                onChange={(e) =>
                  setRequestForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="req-code">
                Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="req-code"
                placeholder="e.g. ML"
                value={requestForm.code}
                onChange={(e) =>
                  setRequestForm((p) => ({ ...p, code: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="req-category">Category</Label>
              <Select
                value={requestForm.category}
                onValueChange={(val) =>
                  setRequestForm((p) => ({ ...p, category: val }))
                }
              >
                <SelectTrigger id="req-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maker">Maker</SelectItem>
                  <SelectItem value="coder">Coder</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="req-icon">
                Icon <span className="text-destructive">*</span>
              </Label>
              <Input
                id="req-icon"
                placeholder="e.g. lightning or https://example.com/icon.png"
                value={requestForm.icon}
                onChange={(e) =>
                  setRequestForm((p) => ({ ...p, icon: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsRequestDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRequest}
              disabled={
                isSubmitting ||
                !requestForm.name.trim() ||
                !requestForm.code.trim() ||
                !requestForm.icon.trim()
              }
            >
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
