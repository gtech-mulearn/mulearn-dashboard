"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { EventListItem } from "@/features/events";
import {
  EventsFilters,
  EventsGrid,
  EventsPagination,
  FeaturedEventsCarousel,
  resolveEventTypeValue,
  useEventsList,
  useEventTypeScope,
} from "@/features/events";
import { useDebounce } from "@/hooks/use-debounce";

// Normalise a string to a slug for comparison (e.g. "Cultural Event" → "cultural_event")
function toSlug(s?: string | null) {
  return (
    s
      ?.trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_") ?? ""
  );
}

export function EventsPageClient() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [selectedCluster, setSelectedCluster] = useState<string>("all");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");

  // ── Types and Scopes API ──────────────────────────────────────────────────
  const { data: typeScopeData, isLoading: isLoadingTypeScope } =
    useEventTypeScope();

  // ── Cluster options ───────────────────────────────────────────────────────
  const clusterList = useMemo(() => {
    if (typeScopeData && Array.isArray(typeScopeData.event_scope)) {
      return [
        { label: "All", value: "all" },
        ...typeScopeData.event_scope.map((scope) => ({
          label: scope,
          value: scope.toLowerCase(),
        })),
      ];
    }
    return [
      { label: "All", value: "all" },
      { label: "Maker", value: "maker" },
      { label: "Coder", value: "coder" },
      { label: "Manager", value: "manager" },
      { label: "Creative", value: "creative" },
    ];
  }, [typeScopeData]);

  // ── Event-type / category options ─────────────────────────────────────────
  const eventTypeOptions = useMemo(() => {
    const list =
      typeScopeData && Array.isArray(typeScopeData.event_type)
        ? typeScopeData.event_type
        : [
            "Hackathon",
            "Workshop",
            "Webinar",
            "Seminar",
            "Bootcamp",
            "Meetup",
            "Conference",
            "Competition",
            "Ideathon",
            "Cultural event",
            "Sports event",
            "Community event",
            "Expo",
            "Networking event",
            "Tech talk",
            "Others",
          ];
    return [
      { label: "All Types", value: "all" },
      ...list.map((type) => ({
        label: type,
        value: type,
      })),
    ];
  }, [typeScopeData]);

  // ── Sort-order arrays ─────────────────────────────────────────────────────
  const categoryOrder = useMemo(
    () => clusterList.filter((c) => c.value !== "all").map((c) => c.value),
    [clusterList],
  );
  const eventTypeOrder = useMemo(
    () =>
      eventTypeOptions
        .filter((t) => t.value !== "all")
        .map((t) => toSlug(t.value)),
    [eventTypeOptions],
  );

  // Helper to extract cluster/event_scope
  const resolveEventCluster = (event: EventListItem): string => {
    const rawCluster =
      event.event_scope ||
      event.organizer?.ig?.cluster ||
      event.organizer?.organiser_ig?.cluster ||
      event.organizer?.ig?.category ||
      event.organizer?.organiser_ig?.category ||
      "";
    return rawCluster.toLowerCase();
  };

  // ── Data fetch ────────────────────────────────────────────────────────────

  const { data, isLoading } = useEventsList({
    pageIndex: currentPage,
    search: debouncedSearch || undefined,
    cluster: selectedCluster === "all" ? undefined : selectedCluster,
    event_type: selectedEventType === "all" ? undefined : selectedEventType,
    sortBy: "-start_datetime",
    perPage: 12,
  });

  const events = data?.data ?? [];
  const pagination = data?.pagination;

  // ── Client-side Filter & Sort ─────────────────────────────────────────────
  const filteredAndSortedEvents = useMemo(() => {
    // 1. Filter events client-side to be absolutely sure the selection is respected
    let result = [...events];

    if (selectedCluster !== "all") {
      result = result.filter((event) => {
        const cluster = resolveEventCluster(event);
        return cluster === selectedCluster.toLowerCase();
      });
    }

    if (selectedEventType !== "all") {
      result = result.filter((event) => {
        const typeSlug = resolveEventTypeValue(
          event.event_type,
          event.category_name,
        );
        return typeSlug === toSlug(selectedEventType);
      });
    }

    // 2. Sort the filtered events
    result.sort((a, b) => {
      // If no cluster filter is active, sort by cluster order first
      if (selectedCluster === "all") {
        const idxA = categoryOrder.indexOf(resolveEventCluster(a));
        const idxB = categoryOrder.indexOf(resolveEventCluster(b));
        const cleanIdxA = idxA !== -1 ? idxA : 999;
        const cleanIdxB = idxB !== -1 ? idxB : 999;
        if (cleanIdxA !== cleanIdxB) return cleanIdxA - cleanIdxB;
      }

      // If no event type filter is active, sort by event type order second
      if (selectedEventType === "all") {
        const typeA =
          resolveEventTypeValue(a.event_type, a.category_name) ?? "";
        const typeB =
          resolveEventTypeValue(b.event_type, b.category_name) ?? "";
        const idxA = eventTypeOrder.indexOf(typeA);
        const idxB = eventTypeOrder.indexOf(typeB);
        const cleanIdxA = idxA !== -1 ? idxA : 999;
        const cleanIdxB = idxB !== -1 ? idxB : 999;
        if (cleanIdxA !== cleanIdxB) return cleanIdxA - cleanIdxB;
      }

      // Fallback: sort by start date descending
      const timeA = new Date(a.start_datetime).getTime();
      const timeB = new Date(b.start_datetime).getTime();
      return timeB - timeA;
    });

    return result;
  }, [
    events,
    selectedCluster,
    selectedEventType,
    categoryOrder,
    eventTypeOrder,
    resolveEventCluster,
  ]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleSearch = (value: string) => {
    setSearch(value);
    if (currentPage !== 1) setCurrentPage(1);
  };
  const handleClusterChange = (value: string) => {
    setSelectedCluster(value);
    setCurrentPage(1);
  };
  const handleEventTypeChange = (value: string) => {
    setSelectedEventType(value);
    setCurrentPage(1);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="flex-1 lc-fade-in">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border pt-6 pb-4 md:pt-8">
        <h1 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
          Events
        </h1>
      </div>

      <div className="space-y-6 py-6">
        <FeaturedEventsCarousel />

        <div className="px-4 md:px-0">
          <EventsFilters
            onSearch={handleSearch}
            selectedCluster={selectedCluster}
            onClusterChange={handleClusterChange}
            selectedEventType={selectedEventType}
            onEventTypeChange={handleEventTypeChange}
            clusters={clusterList}
            isLoadingClusters={isLoadingTypeScope}
            eventTypes={eventTypeOptions}
            isLoadingEventTypes={isLoadingTypeScope}
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
            events={filteredAndSortedEvents}
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
            currentCount={filteredAndSortedEvents.length}
          />
        )}
      </div>
    </main>
  );
}
