"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import type { EventType, IGCluster } from "@/features/events";
import {
  EventsFilters,
  EventsGrid,
  EventsPagination,
  useEventsList,
} from "@/features/events";

export default function EventsPage() {
  const router = useRouter();
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
    perPage: 12,
  });

  const events = data?.data ?? [];
  const pagination = data?.pagination;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleClusterChange = (value: IGCluster | "all") => {
    setSelectedCluster(value);
    setCurrentPage(1);
  };

  const handleEventTypeChange = (value: EventType | "all") => {
    setSelectedEventType(value);
    setCurrentPage(1);
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
          onSearch={handleSearch}
          selectedCluster={selectedCluster}
          onClusterChange={handleClusterChange}
          selectedEventType={selectedEventType}
          onEventTypeChange={handleEventTypeChange}
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
          <EventsGrid
            events={events}
            onEventView={(event) =>
              router.push(`/dashboard/events/${event.id}`)
            }
          />
        )}
      </div>

      {pagination && (
        <EventsPagination
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          currentCount={events.length}
        />
      )}
    </main>
  );
}
