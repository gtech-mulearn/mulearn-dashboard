"use client";

import { useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StateDisplay } from "@/components/ui/state-display";
import { useGysList } from "../hooks";
import type { GysItem } from "../schemas";
import { GysDetailDialog } from "./gys-detail-dialog";
import { MediaCard, MediaCardSkeleton } from "./media-card";

const SKELETONS = Array.from({ length: 6 }, (_, i) => `skeleton-${i}`);

export function GysCards() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sheetItem, setSheetItem] = useState<GysItem | null>(null);

  const { data, isLoading, isError } = useGysList({
    pageIndex: page,
    perPage: 12,
    search,
    status: status || "ongoing,upcoming",
    sortBy: sortBy || undefined,
  });

  const items = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 0;
  const hasSearch = Boolean(search.trim());
  const hasFilters = hasSearch || Boolean(status);

  const handleClearFilters = () => {
    setPage(1);
    setSearch("");
    setStatus("");
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Search sessions..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="max-w-xs rounded-xl"
          />
          <Select
            value={status || "all"}
            onValueChange={(v) => {
              setPage(1);
              setStatus(v === "all" ? "" : v);
            }}
          >
            <SelectTrigger className="w-[140px] rounded-xl border-border bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortBy || undefined}
            onValueChange={(v) => {
              setPage(1);
              setSortBy(v);
            }}
          >
            <SelectTrigger className="w-[170px] rounded-xl border-border bg-background">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date (Soonest first)</SelectItem>
              <SelectItem value="-date">Date (Latest first)</SelectItem>
              <SelectItem value="time">Time (Earliest first)</SelectItem>
              <SelectItem value="-time">Time (Latest first)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SKELETONS.map((key) => (
            <MediaCardSkeleton key={key} />
          ))}
        </div>
      ) : isError ? (
        <StateDisplay
          variant="no-results"
          className="rounded-2xl border border-dashed border-border bg-muted/40"
          title="Failed to load sessions"
          description="Something went wrong while fetching Grab Your Superpowers sessions. Please try again."
        />
      ) : items.length === 0 ? (
        <StateDisplay
          variant="no-results"
          className="rounded-2xl border border-dashed border-border bg-muted/40"
          title={
            hasFilters ? "No matching sessions found" : "No sessions found"
          }
          description={
            hasSearch
              ? "No Grab Your Superpowers sessions match your search. Try changing or clearing your search filters."
              : hasFilters
                ? "No Grab Your Superpowers sessions match the selected filters. Try changing or clearing them."
                : "There are currently no Grab Your Superpowers sessions listed here."
          }
          action={
            hasFilters ? (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <MediaCard
              key={item.id}
              id={item.id}
              title={item.title}
              subtitle={item.campus}
              date={item.date}
              time={item.time}
              status={item.status}
              onClick={() => setSheetItem(item)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {items.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          perPage={12}
          totalCount={data?.pagination.count}
          currentPageCount={items.length}
          handlePreviousClick={() => setPage((p) => p - 1)}
          handleNextClick={() => setPage((p) => p + 1)}
        />
      )}

      {/* Detail dialog */}
      <GysDetailDialog item={sheetItem} onClose={() => setSheetItem(null)} />
    </div>
  );
}
