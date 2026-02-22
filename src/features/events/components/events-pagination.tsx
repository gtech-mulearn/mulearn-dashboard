"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Pagination {
  count: number;
  totalPages: number;
  isNext: boolean;
  isPrev: boolean;
  nextPage?: number | null;
}

interface EventsPaginationProps {
  pagination: Pagination | undefined;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}

export function EventsPagination({
  pagination,
  currentPage,
  onPageChange,
  itemsPerPage = 8,
}: EventsPaginationProps) {
  if (!pagination) return null;

  const pages = Array.from({ length: pagination.totalPages }, (_, i) => i + 1);
  const visiblePages = pages.slice(
    Math.max(0, currentPage - 2),
    Math.min(pages.length, currentPage + 1),
  );

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600">
        Showing <span className="font-medium">{itemsPerPage}</span> out of{" "}
        <span className="font-medium">{pagination.count}</span>
      </div>

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!pagination.isPrev}
          className="rounded-lg"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {visiblePages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "ghost"}
            size="sm"
            onClick={() => onPageChange(page)}
            className={`rounded-lg ${
              page === currentPage
                ? "bg-pink-500 hover:bg-pink-600 text-white"
                : ""
            }`}
          >
            {page}
          </Button>
        ))}

        {pagination.totalPages > currentPage + 1 && (
          <span className="px-2">...</span>
        )}

        {pagination.totalPages > currentPage + 2 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(pagination.totalPages)}
            className="rounded-lg"
          >
            {pagination.totalPages}
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!pagination.isNext}
          className="rounded-lg"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
