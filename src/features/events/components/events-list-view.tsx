/**
 * Events List View
 *
 * 📍 src/features/events/components/events-list-view.tsx
 *
 * Top-level view component for the public events listing page.
 * Manages URL-synced filter/pagination state and composes
 * EventsFilters, EventsGrid, and EventsPagination.
 */

"use client";

import { useCallback, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvents } from "../hooks/events.hooks";
import type { EventListQueryParams } from "../schemas/events.schema";
import { EventsFilters } from "./events-filters";
import { EventsGrid } from "./events-grid";
import { EventsPagination } from "./events-pagination";

export function EventsListView() {
  const [params, setParams] = useState<EventListQueryParams>({
    pageIndex: 1,
    perPage: 12,
  });

  const { data, isLoading } = useEvents(params);

  const events = data?.data ?? [];
  const pagination = data?.pagination;

  const handleParamsChange = useCallback(
    (patch: Partial<EventListQueryParams>) => {
      setParams((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      handleParamsChange({ pageIndex: page });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [handleParamsChange],
  );

  return (
    <main className="flex-1 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Events</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Discover workshops, hackathons, meetups, and more.
        </p>
      </div>

      {/* Filters */}
      <EventsFilters params={params} onParamsChange={handleParamsChange} />

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
      ) : (
        <EventsGrid events={events} />
      )}

      {/* Pagination */}
      <EventsPagination
        pagination={pagination}
        currentPage={params.pageIndex ?? 1}
        onPageChange={handlePageChange}
        perPage={params.perPage}
      />
    </main>
  );
}
