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
  const canGoPrevious = pageIndex > 1;
  const canGoNext = pageIndex < totalPages;

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div className="text-sm text-muted-foreground">
        {startItem > 0 && endItem > 0 ? (
          <>
            Showing{" "}
            <span className="font-medium text-foreground">{startItem}</span> to{" "}
            <span className="font-medium text-foreground">{endItem}</span>{" "}
            entries
          </>
        ) : (
          "No entries"
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!canGoPrevious || isFetching}
          className="h-9 rounded-xl px-3"
        >
          Previous
        </Button>

        <div className="flex h-9 items-center rounded-xl border border-border bg-muted/30 px-3 text-sm font-medium">
          Page {pageIndex} of {totalPages || 1}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!canGoNext || isFetching}
          className="h-9 rounded-xl px-3"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
