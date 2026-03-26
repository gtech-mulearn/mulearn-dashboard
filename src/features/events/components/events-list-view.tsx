"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { useEventsList } from "../hooks";
import type { EventType, IGCluster } from "../types";
import { EventsFilters } from "./events-filters";
import { EventsGrid } from "./events-grid";
import { EventsPagination } from "./events-pagination";

export function EventsListView() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [cluster, setCluster] = useState<IGCluster | "all">("all");
  const [eventType, setEventType] = useState<EventType | "all">("all");

  const debouncedSearch = useDebounce(search, 300);

  const params = useMemo(
    () => ({
      page,
      perPage: 8,
      search: debouncedSearch || undefined,
      cluster: cluster === "all" ? undefined : cluster,
      event_type: eventType === "all" ? undefined : eventType,
    }),
    [cluster, debouncedSearch, eventType, page],
  );

  const { data, isLoading, isError, error, refetch } = useEventsList(params);
  const events = data?.data ?? [];

  return (
    <div className="space-y-6">
      <EventsFilters
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        selectedCluster={cluster}
        onClusterChange={(value) => {
          setCluster(value);
          setPage(1);
        }}
        selectedEventType={eventType}
        onEventTypeChange={(value) => {
          setEventType(value);
          setPage(1);
        }}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="text-sm">
            {error instanceof Error ? error.message : "Failed to load events"}
          </p>
          <Button className="mt-3" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          <EventsGrid events={events} />
          <EventsPagination
            pagination={data?.pagination}
            currentPage={page}
            onPageChange={(value) => setPage(value)}
          />
        </>
      )}
    </div>
  );
}
