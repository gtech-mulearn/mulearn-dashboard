"use client";

import { PowerOff, Star } from "lucide-react";
import { useState } from "react";
import { DataTableErrorBoundary } from "@/components/dashboard/DataTableErrorBoundary";
import Pagination from "@/components/dashboard/table/pagination";
import type { Data } from "@/components/dashboard/table/Table";
import Table from "@/components/dashboard/table/Table";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StateDisplay } from "@/components/ui/state-display";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useDeactivateMentor,
  useMentorRoster,
} from "../hooks/use-mentor-verify";
import type { MentorRosterItem } from "../schemas";
import { MENTOR_TIERS } from "../schemas";

// ─── Constants ────────────────────────────────────────────────────────────────

const PER_PAGE = 10;
const MAX_REASON_LENGTH = 500;

const TIER_LABELS: Record<string, string> = {
  IG_MENTOR: "IG Mentor",
  MENTOR: "Platform Mentor",
  COMPANY_MENTOR: "Company Mentor",
  CAMPUS_MENTOR: "Campus Mentor",
};

const columnOrder = [
  { column: "name", Label: "Name", isSortable: false },
  { column: "tier_badge", Label: "Status", isSortable: false },
  { column: "avg_rating", Label: "Avg Rating", isSortable: false },
  { column: "rating_count", Label: "Sessions Rated", isSortable: false },
];

// ─── Star rating visual ────────────────────────────────────────────────────────

function StarRating({ value }: { value: number | null | undefined }) {
  if (value == null) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  const filled = Math.round(value);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3.5 w-3.5 ${
              star <= filled
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted-foreground/40"
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-medium tabular-nums">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

// ─── Deactivate Dialog ────────────────────────────────────────────────────────
// A custom dialog (not ConfirmDialog) because the API requires a reason field.

interface DeactivateDialogProps {
  mentor: MentorRosterItem | null;
  onOpenChange: (open: boolean) => void;
}

function DeactivateDialog({ mentor, onOpenChange }: DeactivateDialogProps) {
  const [reason, setReason] = useState("");
  const deactivate = useDeactivateMentor();

  function handleClose() {
    setReason("");
    onOpenChange(false);
  }

  function handleConfirm() {
    if (!mentor || !reason.trim()) return;
    deactivate.mutate(
      { userMentorId: mentor.id, reason: reason.trim() },
      { onSuccess: handleClose },
    );
  }

  const isOverLimit = reason.length > MAX_REASON_LENGTH;
  const canSubmit =
    reason.trim().length > 0 && !isOverLimit && !deactivate.isPending;

  return (
    <Dialog open={!!mentor} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <PowerOff className="h-5 w-5" />
            </div>
            <DialogTitle>
              Deactivate {mentor?.user_full_name ?? "mentor"}?
            </DialogTitle>
          </div>
          <DialogDescription className="pt-1">
            This is a global kill-switch. The mentor cannot create sessions,
            switch to mentor persona, or appear in the roster until reactivated.
            Their tier grants and application records stay intact.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="deactivate-reason" className="text-sm font-medium">
            Reason{" "}
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </Label>
          <Textarea
            id="deactivate-reason"
            placeholder="e.g. Repeated no-shows to scheduled sessions…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className={
              isOverLimit
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
          />
          <p
            className={`text-right text-xs ${
              isOverLimit ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {reason.length} / {MAX_REASON_LENGTH}
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={deactivate.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canSubmit}
            id="deactivate-mentor-confirm"
          >
            {deactivate.isPending ? "Deactivating…" : "Deactivate mentor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

function RosterTable({
  items,
  isLoading,
  page,
  totalPages,
  totalItems,
  onPageChange,
  onDeactivate,
}: {
  items: MentorRosterItem[] | undefined;
  isLoading: boolean;
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onDeactivate: (m: MentorRosterItem) => void;
}) {
  const rows: Data[] = (items ?? []).map((m) => ({
    id: m.id,
    name: m.user_full_name,
    tier_badge: "",
    avg_rating: m.avg_rating ?? null,
    rating_count: m.rating_count,
  }));

  const customCellRender = (column: string, row: Data) => {
    const m = items?.find((item) => item.id === row.id);
    if (!m) return null;

    if (column === "name") {
      return <p className="font-medium">{m.user_full_name || "—"}</p>;
    }
    if (column === "tier_badge") {
      return (
        <Badge variant="outline" className="text-xs">
          Active
        </Badge>
      );
    }
    if (column === "avg_rating") {
      return <StarRating value={m.avg_rating} />;
    }
    if (column === "rating_count") {
      return (
        <span className="tabular-nums text-sm">
          {m.rating_count > 0 ? m.rating_count : "—"}
        </span>
      );
    }
    return null;
  };

  const customActionRender = (row: Data) => {
    const m = items?.find((item) => item.id === row.id);
    if (!m) return null;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            onClick={() => onDeactivate(m)}
            id={`deactivate-btn-${m.id}`}
          >
            <PowerOff className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Deactivate mentor</TooltipContent>
      </Tooltip>
    );
  };

  if (!isLoading && (!items || items.length === 0)) {
    return (
      <StateDisplay
        variant="no-results"
        title="No mentors found"
        description="No active mentors match the current filters."
      />
    );
  }

  return (
    <DataTableErrorBoundary>
      <Table
        rows={rows}
        isLoading={isLoading}
        page={page}
        perPage={PER_PAGE}
        columnOrder={columnOrder}
        id={["id"]}
        customCellRender={customCellRender}
        customActionRender={customActionRender}
      >
        <THead columnOrder={columnOrder} onIconClick={() => {}} action={true} />
        <div className="p-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            perPage={PER_PAGE}
            totalCount={totalItems}
            currentPageCount={items?.length}
            handlePreviousClick={() => onPageChange(Math.max(1, page - 1))}
            handleNextClick={() => onPageChange(page + 1)}
          />
        </div>
      </Table>
    </DataTableErrorBoundary>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

export function MentorRosterTab() {
  const [lowRating, setLowRating] = useState(false);
  const [page, setPage] = useState(1);
  const [deactivateFor, setDeactivateFor] = useState<MentorRosterItem | null>(
    null,
  );

  const { data, isLoading } = useMentorRoster({
    low_rating: lowRating || undefined,
    page,
    per_page: PER_PAGE,
  });

  function handleLowRatingToggle() {
    setLowRating((prev) => !prev);
    setPage(1);
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            id="roster-low-rating-toggle"
            variant={lowRating ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={handleLowRatingToggle}
          >
            Low rating only
            <span className="text-xs opacity-70">
              (avg &lt; 3.0, 5+ sessions)
            </span>
          </Button>

          {lowRating && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => {
                setLowRating(false);
                setPage(1);
              }}
            >
              Clear filters
            </Button>
          )}

          {data && (
            <span className="ml-auto text-xs text-muted-foreground">
              {data.totalItems} mentor{data.totalItems !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Table */}
        <RosterTable
          items={data?.data}
          isLoading={isLoading}
          page={page}
          totalPages={data?.totalPages ?? 1}
          totalItems={data?.totalItems ?? 0}
          onPageChange={setPage}
          onDeactivate={setDeactivateFor}
        />

        {/* Deactivate dialog — custom because reason field is required */}
        <DeactivateDialog
          mentor={deactivateFor}
          onOpenChange={(v) => !v && setDeactivateFor(null)}
        />
      </div>
    </TooltipProvider>
  );
}
