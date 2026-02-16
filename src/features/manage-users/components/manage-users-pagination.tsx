"use client";

import { Button } from "@/components/ui/button";

interface ManageUsersPaginationProps {
  startItem: number;
  endItem: number;
  pageIndex: number;
  totalPages: number;
  isFetching: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function ManageUsersPagination({
  startItem,
  endItem,
  pageIndex,
  totalPages,
  isFetching,
  onPrevious,
  onNext,
}: ManageUsersPaginationProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {startItem} - {endItem}
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={pageIndex <= 1 || isFetching}
        >
          Previous
        </Button>
        <span className="min-w-20 text-center text-sm text-foreground">
          {pageIndex} / {Math.max(totalPages, 1)}
        </span>
        <Button
          type="button"
          variant="outline"
          onClick={onNext}
          disabled={pageIndex >= totalPages || totalPages === 0 || isFetching}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
