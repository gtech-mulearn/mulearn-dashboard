"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EventsFilters,
  EventsGrid,
  EventsPagination,
  FeaturedEventsCarousel,
  useEventsList,
  useIGClusters,
  EVENT_TYPE_OPTIONS,
} from "@/features/events";
import type { EventType } from "@/features/events";
import { useDebounce } from "@/hooks/use-debounce";

export function EventsPageClient() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCluster, setSelectedCluster] = useState<string>("all");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const debouncedSearch = useDebounce(search, 300);

  // Fetch cluster options dynamically from the IG list API
  const { data: clusterOptions, isLoading: isLoadingClusters } = useIGClusters();
  const clusterList = clusterOptions ?? [{ label: "All", value: "all" }];

  const eventTypeOptions = EVENT_TYPE_OPTIONS;

  // Build a label→value map for client-side cluster sorting
  const categoryOrder = clusterList
    .filter((c) => c.value !== "all")
    .map((c) => c.value);

  const { data, isLoading } = useEventsList({
    pageIndex: currentPage,
    search: debouncedSearch || undefined,
    cluster: selectedCluster === "all" ? undefined : selectedCluster,
    event_type: selectedEventType === "all" ? undefined : (selectedEventType as EventType),
    sortBy: "-start_datetime",
    perPage: 12,
  });

  const events = data?.data ?? [];
  const pagination = data?.pagination;


  // Client-side sorting: Sort by cluster when "All" is selected
  const sortedEvents = [...events];

  if (selectedCluster === "all") {
    sortedEvents.sort((a, b) => {
      const getClusterIndex = (event: (typeof events)[0]) => {
        const directCluster =
          event.organizer?.ig?.cluster ||
          event.organizer?.organiser_ig?.cluster ||
          event.organizer?.ig?.category ||
          event.organizer?.organiser_ig?.category;

        if (directCluster) {
          const idx = categoryOrder.indexOf(directCluster.toLowerCase());
          if (idx !== -1) return idx;
        }

        return 999;
      };

      const idxA = getClusterIndex(a);
      const idxB = getClusterIndex(b);

      if (idxA !== idxB) return idxA - idxB;

      return (
        new Date(b.start_datetime).getTime() -
        new Date(a.start_datetime).getTime()
      );
    });
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleClusterChange = (value: string) => {
    setSelectedCluster(value);
    setCurrentPage(1);
  };

  const handleEventTypeChange = (value: string) => {
    setSelectedEventType(value);
    setCurrentPage(1);
  };

  return (
    <main className="flex-1 lc-fade-in">
      {/* Sticky header: title only */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border pt-6 pb-4 md:pt-8">
        <h1 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
          Events
        </h1>
      </div>

      {/* Scrollable content */}
      <div className="space-y-6 py-6">
        <FeaturedEventsCarousel />

        {/* Filters below carousel */}
        <div className="px-4 md:px-0">
          <EventsFilters
            onSearch={handleSearch}
            selectedCluster={selectedCluster}
            onClusterChange={handleClusterChange}
            selectedEventType={selectedEventType}
            onEventTypeChange={handleEventTypeChange}
            clusters={clusterList}
            isLoadingClusters={isLoadingClusters}
            eventTypes={eventTypeOptions}
            isLoadingEventTypes={false}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        ) : (
          <EventsGrid
            events={sortedEvents}
            onEventView={(event) =>
              router.push(`/dashboard/events/${event.id}`)
            }
          />
        )}

        {pagination && (
          <EventsPagination
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            currentCount={events.length}
          />
        )}
      </div>
    </main>
  );
}
