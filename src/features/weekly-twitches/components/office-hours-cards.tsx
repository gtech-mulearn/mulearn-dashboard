"use client";

import { useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOfficeHoursList } from "../hooks";
import type { OfficeHoursItem } from "../schemas";
import { MediaCard, MediaCardSkeleton } from "./media-card";
import { OfficeHoursDetailDialog } from "./office-hours-detail-dialog";

const SKELETONS = Array.from({ length: 6 }, (_, i) => `skeleton-${i}`);

export function OfficeHoursCards() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sheetItem, setSheetItem] = useState<OfficeHoursItem | null>(null);

  const { data, isLoading, isError } = useOfficeHoursList({
    pageIndex: page,
    perPage: 12,
    search,
    status: status || undefined,
  });

  const items = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 0;
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
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? SKELETONS.map((key) => <MediaCardSkeleton key={key} />)
          : items.map((item) => (
              <MediaCard
                key={item.id}
                id={item.id}
                title={item.title}
                subtitle={item.performer ?? undefined}
                date={item.date}
                status={item.status}
                imageSrc={item.poster_thumbnail}
                onClick={() => setSheetItem(item)}
              />
            ))}
      </div>

      {/* Error */}
      {!isLoading && isError && (
        <div className="flex flex-col items-center justify-center py-16 text-destructive">
          <p className="text-sm">Failed to load sessions. Please try again.</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p className="text-sm">No sessions found.</p>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        perPage={12}
        totalCount={data?.pagination.count}
        currentPageCount={items.length}
        handlePreviousClick={() => setPage((p) => p - 1)}
        handleNextClick={() => setPage((p) => p + 1)}
      />

      {/* Detail dialog */}
      <OfficeHoursDetailDialog
        item={sheetItem}
        onClose={() => setSheetItem(null)}
      />
    </div>
  );
}
