"use client";

import { LayoutGrid, List } from "lucide-react";
import { SearchBar } from "@/components/dashboard/table/SearchBar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FEED_SORT_OPTIONS,
  FEED_STATUS_PILLS,
} from "../constants/problem-statement.constants";
import type { FeedStatusFilter } from "../types/problem-statement.types";

interface ProblemStatementsFiltersProps {
  statusFilter: FeedStatusFilter;
  onStatusChange: (status: FeedStatusFilter) => void;
  search: string;
  onSearch: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  sortBy: string;
  onSortChange: (value: string) => void;
  viewMode: "board" | "table";
  onViewModeChange: (mode: "board" | "table") => void;
  isAuthenticated?: boolean;
}

export function ProblemStatementsFilters({
  statusFilter,
  onStatusChange,
  search: _search,
  onSearch,
  selectedCategory,
  onCategoryChange,
  categories,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  isAuthenticated = false,
}: ProblemStatementsFiltersProps) {
  // Only show "I'm Trying" and "Submitted" pills if user is authenticated
  const visiblePills = FEED_STATUS_PILLS.filter(
    (pill) =>
      (pill.value !== "trying" && pill.value !== "submitted") ||
      isAuthenticated,
  );

  return (
    <div className="space-y-4">
      {/* Top row: Status Pills & View Mode Toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Feed Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-muted/60 p-1 border border-border/50">
          {visiblePills.map((pill) => {
            const isActive = statusFilter === pill.value;
            return (
              <button
                key={pill.value}
                type="button"
                onClick={() => onStatusChange(pill.value)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle: Board vs Table */}
        <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1 border border-border/50 self-start sm:self-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange("board")}
            className={`h-8 px-2.5 rounded-lg text-xs font-medium gap-1.5 ${
              viewMode === "board"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Board</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange("table")}
            className={`h-8 px-2.5 rounded-lg text-xs font-medium gap-1.5 ${
              viewMode === "table"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>Table</span>
          </Button>
        </div>
      </div>

      {/* Second row: Search & Category / Sort Dropdowns */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="sm:col-span-2 lg:col-span-2">
          <SearchBar
            onSearch={onSearch}
            placeholder="Search by title, description or company..."
            size="md"
            showButton={false}
            className="w-full"
          />
        </div>

        {/* Category */}
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full rounded-xl bg-card border-border/80 text-xs">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full rounded-xl bg-card border-border/80 text-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {FEED_SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
