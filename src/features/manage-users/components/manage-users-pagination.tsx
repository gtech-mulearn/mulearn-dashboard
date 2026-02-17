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
    <div className="flex flex-col items-start justify-between gap-4 border-t border-border/40 pt-4 sm:flex-row sm:items-center">
      <div className="text-sm sm:text-base text-muted-foreground">
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

      <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-normal">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious || isFetching}
          className="h-10 rounded-xl border-primary/30 px-4 text-sm font-semibold text-primary transition-all hover:bg-primary/10 disabled:border-border"
        >
          Previous
        </Button>

        <div className="flex h-10 items-center rounded-xl border border-primary/20 bg-primary/[0.06] px-4 text-sm font-semibold text-foreground">
          Page {pageIndex} of {totalPages || 1}
        </div>

        <Button
          variant="default"
          onClick={onNext}
          disabled={!canGoNext || isFetching}
          className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-all hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
