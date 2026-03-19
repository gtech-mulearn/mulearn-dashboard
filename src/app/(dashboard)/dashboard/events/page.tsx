"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { EventType, IGCluster } from "@/features/events";
import {
  EventsFilters,
  EventsGrid,
  EventsPagination,
  useEventsList,
} from "@/features/events";

export default function EventsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCluster, setSelectedCluster] = useState<IGCluster | "all">(
    "all",
  );
  const [selectedEventType, setSelectedEventType] = useState<EventType | "all">(
    "all",
  );

  const { data, isLoading } = useEventsList({
    page: currentPage,
    search: search || undefined,
    cluster: selectedCluster === "all" ? undefined : selectedCluster,
    event_type: selectedEventType === "all" ? undefined : selectedEventType,
    sortBy: "-start_datetime",
  });

  const events = data?.data ?? [];
  const pagination = data?.pagination;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="flex-1 p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Events</h1>
        </div>
      </div>

      <div className="mb-6">
        <EventsFilters
          onSearch={setSearch}
          selectedCluster={selectedCluster}
          onClusterChange={setSelectedCluster}
          selectedEventType={selectedEventType}
          onEventTypeChange={setSelectedEventType}
        />
      </div>

      <div className="mb-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        ) : (
          <EventsGrid events={events} />
        )}
      </div>

      {pagination && (
        <EventsPagination
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}
    </main>
  );
}
