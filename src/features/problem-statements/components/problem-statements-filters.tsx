"use client";

import { ArrowUpDown } from "lucide-react";
import { SearchBar } from "@/components/dashboard/table/SearchBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BROWSE_STATUS_OPTIONS,
  CATEGORY_SUGGESTIONS,
  FEED_SORT_OPTIONS,
  PARTICIPATION_STATUS_OPTIONS,
} from "../constants/problem-statement.constants";
import type {
  FeedTab,
  ProblemStatementViewMode,
} from "../types/problem-statement.types";
import { ProblemStatementsViewToggle } from "./problem-statements-view-toggle";

interface ProblemStatementsFiltersProps {
  tab: FeedTab;
  onSearch: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  viewMode: ProblemStatementViewMode;
  onViewModeChange: (mode: ProblemStatementViewMode) => void;
}

/** Search + category / status / sort + layout toggle for the learner feed. */
export function ProblemStatementsFilters({
  tab,
  onSearch,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: ProblemStatementsFiltersProps) {
  const statusOptions =
    tab === "browse" ? BROWSE_STATUS_OPTIONS : PARTICIPATION_STATUS_OPTIONS;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <SearchBar
        onSearch={onSearch}
        placeholder="Search by title, description or company…"
        size="sm"
        showButton={false}
        className="lg:max-w-sm"
      />

      <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-40" aria-label="Filter by category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORY_SUGGESTIONS.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-36" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-auto min-w-40" aria-label="Sort by">
            <ArrowUpDown />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {FEED_SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ProblemStatementsViewToggle
          value={viewMode}
          onChange={onViewModeChange}
        />
      </div>
    </div>
  );
}
