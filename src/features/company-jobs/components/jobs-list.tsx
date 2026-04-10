"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Job, Pagination } from "../types";
import { JobCard } from "./job-card";

interface JobsListProps {
  jobs: Job[];
  pagination: Pagination;
  currentPage: number;
  onPageChange: (page: number) => void;
  onViewJob: (jobId: string) => void;
}

export function JobsList({
  jobs,
  pagination,
  currentPage,
  onPageChange,
  onViewJob,
}: JobsListProps) {
  return (
    <div className="space-y-6">
      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} onView={onViewJob} />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {pagination.totalPages} • {pagination.count}{" "}
            total
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.isPrev}
              onClick={() => onPageChange(currentPage - 1)}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.isNext}
              onClick={() => onPageChange(currentPage + 1)}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
