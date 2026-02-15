"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ManageUsersPaginationProps {
  pageIndex: number;
  perPage: number;
  totalPages: number;
  totalCount?: number;
  currentRowsCount: number;
  onPageChange: (page: number) => void;
}

export function ManageUsersPagination({
  pageIndex,
  perPage,
  totalPages,
  totalCount,
  currentRowsCount,
  onPageChange,
}: ManageUsersPaginationProps) {
  const safeTotalPages = Math.max(1, totalPages || 1);
  const canPrev = pageIndex > 1;
  const canNext = pageIndex < safeTotalPages;
  const start = currentRowsCount === 0 ? 0 : (pageIndex - 1) * perPage + 1;
  const end = currentRowsCount === 0 ? 0 : start + currentRowsCount - 1;
  const total = totalCount ?? end;

  return (
    <div className="bg-card border-border flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3">
      <p className="text-muted-foreground text-sm">
        {start} - {end} of {total}
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={!canPrev}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
        <span className="text-sm font-medium">
          {pageIndex} / {safeTotalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={!canNext}
          className="gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
