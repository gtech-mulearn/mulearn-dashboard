"use client";

import Pagination from "@/components/dashboard/table/pagination";
import type { Pagination as PaginationMeta } from "../types/problem-statement.types";

interface ProblemStatementsPaginationProps {
  pagination: PaginationMeta | undefined;
  currentPage: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

/** Adapter from the API's pagination envelope onto the shared dashboard pager. */
export function ProblemStatementsPagination({
  pagination,
  currentPage,
  perPage,
  onPageChange,
}: ProblemStatementsPaginationProps) {
  if (!pagination || pagination.count === 0) return null;

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={Math.max(1, pagination.totalPages)}
      perPage={perPage}
      totalCount={pagination.count}
      handlePreviousClick={() => onPageChange(currentPage - 1)}
      handleNextClick={() => onPageChange(currentPage + 1)}
    />
  );
}
