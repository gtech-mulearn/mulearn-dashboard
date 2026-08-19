import { ArrowUpDown, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JOB_SORT_OPTIONS } from "../constants";
import type { JobSortValue } from "../types";

interface JobsPageHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onCreateJob: () => void;
  totalJobs?: number;
  sortBy: JobSortValue;
  onSortChange: (value: JobSortValue) => void;
}

export function JobsPageHeader({
  searchValue,
  onSearchChange,
  onCreateJob,
  totalJobs,
  sortBy,
  onSortChange,
}: JobsPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Jobs
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalJobs !== undefined
            ? `${totalJobs} job${totalJobs !== 1 ? "s" : ""} posted`
            : "Manage your job listings"}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-0 flex-1 sm:flex-initial">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="jobs-search"
            placeholder="Search jobs..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 sm:w-64"
          />
        </div>

        <Select
          value={sortBy}
          onValueChange={(value) => onSortChange(value as JobSortValue)}
        >
          <SelectTrigger
            className="w-auto min-w-38 gap-2"
            aria-label="Sort jobs"
          >
            <ArrowUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {JOB_SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={onCreateJob} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create Job</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>
    </div>
  );
}
