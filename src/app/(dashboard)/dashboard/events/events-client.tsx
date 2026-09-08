"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserProfile } from "@/features/auth";
import type { EventListItem } from "@/features/events";
import {
  EVENT_SORT_DEFAULT,
  EventsFilters,
  EventsGrid,
  EventsPagination,
  FeaturedEventsCarousel,
  getEventPublisherName,
  getPublisherBucket,
  isEventFromUserCollege,
  resolveEventTypeValue,
  sortEventsByPublisher,
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

interface EventsFilterCache {
  search?: string;
  cluster?: string;
  eventType?: string;
  publisher?: string;
  sortBy?: string;
  page?: number;
}

let cachedEventsFilters: EventsFilterCache | null = null;

export function EventsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial filter state from URL search params with fallback to in-memory cache
  const [currentPage, setCurrentPage] = useState(() => {
    const p = Number(searchParams.get("page"));
    if (p > 0) return p;
    return cachedEventsFilters?.page ?? 1;
  });

  const [search, setSearch] = useState(() => {
    return searchParams.get("q") ?? cachedEventsFilters?.search ?? "";
  });
  const debouncedSearch = useDebounce(search, 300);

  const [selectedCluster, setSelectedCluster] = useState<string>(() => {
    return searchParams.get("cluster") ?? cachedEventsFilters?.cluster ?? "all";
  });

  const [selectedEventType, setSelectedEventType] = useState<string>(() => {
    return searchParams.get("type") ?? cachedEventsFilters?.eventType ?? "all";
  });

  const [selectedPublisher, setSelectedPublisher] = useState<string>(() => {
    return (
      searchParams.get("publisher") ?? cachedEventsFilters?.publisher ?? "all"
    );
  });

  const [sortBy, setSortBy] = useState<string>(() => {
    return (
      searchParams.get("sort") ??
      cachedEventsFilters?.sortBy ??
      EVENT_SORT_DEFAULT
    );
  });

  // ── User Profile for College Prioritization ───────────────────────────────
  const { data: userProfile } = useUserProfile();

  // ── Types and Scopes API ──────────────────────────────────────────────────
  const { data: typeScopeData, isLoading: isLoadingTypeScope } =
    useEventTypeScope();

  // ── Cluster options ───────────────────────────────────────────────────────
  const clusterList = useMemo(
    () => [
      { label: "All", value: "all" },
      ...(typeScopeData?.event_scope ?? []).map((scope) => ({
        label: scope.label,
        value: scope.value,
      })),
    ],
    [typeScopeData],
  );

  // ── Event-type / category options ─────────────────────────────────────────
  const eventTypeOptions = useMemo(
    () => [
      { label: "All Types", value: "all" },
      ...(typeScopeData?.event_type ?? []).map((type) => ({
        label: type.label,
        value: type.value,
      })),
    ],
    [typeScopeData],
  );

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
  const resolveEventCluster = useCallback((event: EventListItem): string => {
    const rawCluster =
      event.event_scope ||
      event.organizer?.ig?.cluster ||
      event.organizer?.organiser_ig?.cluster ||
      event.organizer?.ig?.category ||
      event.organizer?.organiser_ig?.category ||
      "";
    return rawCluster.toLowerCase();
  }, []);

  // ── Data fetch ────────────────────────────────────────────────────────────
  const { data, isLoading } = useEventsList({
    pageIndex: currentPage,
    search: debouncedSearch || undefined,
    status: "published",
    sortBy: sortBy.startsWith("publisher_") ? EVENT_SORT_DEFAULT : sortBy,
    perPage: 12,
  });

  const events = data?.data ?? [];
  const pagination = data?.pagination;

  // ── Publisher bucket ──────────────────────────────────────────────────────
  const publisherBucket = useMemo(() => getPublisherBucket(events), [events]);

  // ── Sync URL & in-memory cache for persistence ─────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (selectedCluster && selectedCluster !== "all")
      params.set("cluster", selectedCluster);
    if (selectedEventType && selectedEventType !== "all")
      params.set("type", selectedEventType);
    if (selectedPublisher && selectedPublisher !== "all")
      params.set("publisher", selectedPublisher);
    if (sortBy && sortBy !== EVENT_SORT_DEFAULT) params.set("sort", sortBy);
    if (currentPage > 1) params.set("page", String(currentPage));

    const nextQs = params.toString();
    const currentQs = searchParams.toString();
    if (nextQs !== currentQs) {
      const qs = nextQs ? `?${nextQs}` : "";
      router.replace(`/dashboard/events${qs}`, { scroll: false });
    }

    cachedEventsFilters = {
      search: debouncedSearch,
      cluster: selectedCluster,
      eventType: selectedEventType,
      publisher: selectedPublisher,
      sortBy,
      page: currentPage,
    };
  }, [
    debouncedSearch,
    selectedCluster,
    selectedEventType,
    selectedPublisher,
    sortBy,
    currentPage,
    router,
    searchParams,
  ]);

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

    if (selectedPublisher !== "all") {
      result = result.filter((event) => {
        const pub = getEventPublisherName(event);
        return pub.toLowerCase() === selectedPublisher.toLowerCase();
      });
    }

    // 2. Sort the filtered events
    if (sortBy === "publisher_asc") {
      result = sortEventsByPublisher(result, "asc");
    } else if (sortBy === "publisher_desc") {
      result = sortEventsByPublisher(result, "desc");
    } else {
      result.sort((a, b) => {
        // Prioritize events from the user's college on default/date sorting
        const aIsCollege = isEventFromUserCollege(a, userProfile);
        const bIsCollege = isEventFromUserCollege(b, userProfile);

        if (aIsCollege && !bIsCollege) return -1;
        if (!aIsCollege && bIsCollege) return 1;

        if (sortBy === "created_at") {
          const timeA = new Date(a.created_at || a.start_datetime).getTime();
          const timeB = new Date(b.created_at || b.start_datetime).getTime();
          return timeA - timeB;
        }
        if (sortBy === "-created_at") {
          const timeA = new Date(a.created_at || a.start_datetime).getTime();
          const timeB = new Date(b.created_at || b.start_datetime).getTime();
          return timeB - timeA;
        }

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
    }

    return result;
  }, [
    events,
    selectedCluster,
    selectedEventType,
    selectedPublisher,
    sortBy,
    userProfile,
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
  const handleSortChange = (value: string) => {
    setSortBy(value);
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
  const handlePublisherChange = (value: string) => {
    setSelectedPublisher(value);
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
            selectedPublisher={selectedPublisher}
            onPublisherChange={handlePublisherChange}
            publishers={publisherBucket}
            clusters={clusterList}
            isLoadingClusters={isLoadingTypeScope}
            eventTypes={eventTypeOptions}
            isLoadingEventTypes={isLoadingTypeScope}
            sortBy={sortBy}
            onSortChange={handleSortChange}
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
