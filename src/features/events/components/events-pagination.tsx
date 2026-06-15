"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "../types";

interface EventsPaginationProps {
  pagination: PaginationMeta | undefined;
  currentPage: number;
  onPageChange: (page: number) => void;
  currentCount?: number;
}

export function EventsPagination({
  pagination,
  currentPage,
  onPageChange,
  currentCount,
}: EventsPaginationProps) {
  if (!pagination) return null;

  const apiPageSize =
    pagination.pageSize ??
    pagination.perPage ??
    pagination.page_size ??
    pagination.per_page ??
    null;

  // Prefer server-provided current page count, then API page size.
  // If neither exists, avoid guessing and fall back to the total count.
  const shownCount =
    currentCount ??
    (typeof apiPageSize === "number" ? apiPageSize : pagination.count);

  const pages = Array.from({ length: pagination.totalPages }, (_, i) => i + 1);
  const visiblePages = pages.slice(
    Math.max(0, currentPage - 2),
    Math.min(pages.length, currentPage + 1),
  );

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{shownCount}</span> out of{" "}
        <span className="font-medium">{pagination.count}</span>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!pagination.isPrev}
            className="h-8 w-8 rounded-full"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {visiblePages.map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(page)}
              className="h-8 w-8 rounded-full"
            >
              {page}
            </Button>
          ))}

          {pagination.totalPages > currentPage + 1 && (
            <span className="px-2 text-brand-blue">...</span>
          )}

          {pagination.totalPages > currentPage + 2 && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(pagination.totalPages)}
              className="h-8 w-8 rounded-full"
            >
              {pagination.totalPages}
            </Button>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!pagination.isNext}
            className="h-8 w-8 rounded-full"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
