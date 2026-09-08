"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserProfile } from "@/features/auth";
import type { EventListItem, PaginationMeta } from "@/features/events";
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

const FETCH_ALL_LIMIT = 200;
const PAGE_SIZE = 12;

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

  // Derive filter values directly from searchParams to avoid stale state on popstate/history navigation
  const selectedCluster = searchParams.get("cluster") ?? "all";
  const selectedEventType = searchParams.get("type") ?? "all";
  const selectedPublisher = searchParams.get("publisher") ?? "all";
  const sortBy = searchParams.get("sort") ?? EVENT_SORT_DEFAULT;
  const currentPage =
    Number(searchParams.get("page")) > 0 ? Number(searchParams.get("page")) : 1;

  // Local state for immediate typing responsiveness with debounced URL synchronization
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("q") ?? cachedEventsFilters?.search ?? "",
  );
  const debouncedSearch = useDebounce(searchInput, 300);

  // Sync search input if URL changes externally (e.g. back/forward navigation)
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    if (q !== searchInput) {
      setSearchInput(q);
    }
  }, [searchParams, searchInput]);

  // Restore cached filters on initial mount if landing on a naked URL
  useEffect(() => {
    if (!searchParams.toString() && cachedEventsFilters) {
      const params = new URLSearchParams();
      if (cachedEventsFilters.search)
        params.set("q", cachedEventsFilters.search);
      if (cachedEventsFilters.cluster && cachedEventsFilters.cluster !== "all")
        params.set("cluster", cachedEventsFilters.cluster);
      if (
        cachedEventsFilters.eventType &&
        cachedEventsFilters.eventType !== "all"
      )
        params.set("type", cachedEventsFilters.eventType);
      if (
        cachedEventsFilters.publisher &&
        cachedEventsFilters.publisher !== "all"
      )
        params.set("publisher", cachedEventsFilters.publisher);
      if (
        cachedEventsFilters.sortBy &&
        cachedEventsFilters.sortBy !== EVENT_SORT_DEFAULT
      )
        params.set("sort", cachedEventsFilters.sortBy);
      if (cachedEventsFilters.page && cachedEventsFilters.page > 1)
        params.set("page", String(cachedEventsFilters.page));

      const qs = params.toString();
      if (qs) {
        router.replace(`/dashboard/events?${qs}`, { scroll: false });
      }
    }
  }, [searchParams, router]); // Evaluates correctly on mount

  // Keep in-memory cache synchronized with URL params
  useEffect(() => {
    cachedEventsFilters = {
      search: searchParams.get("q") ?? "",
      cluster: searchParams.get("cluster") ?? "all",
      eventType: searchParams.get("type") ?? "all",
      publisher: searchParams.get("publisher") ?? "all",
      sortBy: searchParams.get("sort") ?? EVENT_SORT_DEFAULT,
      page: Number(searchParams.get("page")) || 1,
    };
  }, [searchParams]);

  // Push URL updates
  const updateUrl = useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (
          value === null ||
          value === undefined ||
          value === "" ||
          value === "all" ||
          (key === "sort" && value === EVENT_SORT_DEFAULT) ||
          (key === "page" && Number(value) <= 1)
        ) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }
      // Reset page when any filter other than page changes
      if (!("page" in updates)) {
        params.delete("page");
      }
      const qs = params.toString();
      const currentQs = searchParams.toString();
      if (qs !== currentQs) {
        router.replace(`/dashboard/events${qs ? `?${qs}` : ""}`, {
          scroll: false,
        });
      }
    },
    [searchParams, router],
  );

  // Sync debounced search to URL
  useEffect(() => {
    const currentQ = searchParams.get("q") ?? "";
    if (debouncedSearch !== currentQ) {
      updateUrl({ q: debouncedSearch });
    }
  }, [debouncedSearch, searchParams, updateUrl]);

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

  // ── Data fetch: retrieve full set so publisher discovery and sorting is global
  const { data, isLoading } = useEventsList({
    search: debouncedSearch || undefined,
    status: "published",
    sortBy: sortBy.startsWith("publisher_") ? EVENT_SORT_DEFAULT : sortBy,
    pageIndex: 1,
    perPage: FETCH_ALL_LIMIT,
  });

  const events = data?.data ?? [];

  // ── Publisher bucket computed across ALL fetched events ────────────────────
  const publisherBucket = useMemo(() => getPublisherBucket(events), [events]);

  // ── Client-side Filter & Sort across complete collection ──────────────────
  const filteredAndSortedEvents = useMemo(() => {
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

        if (selectedCluster === "all") {
          const idxA = categoryOrder.indexOf(resolveEventCluster(a));
          const idxB = categoryOrder.indexOf(resolveEventCluster(b));
          const cleanIdxA = idxA !== -1 ? idxA : 999;
          const cleanIdxB = idxB !== -1 ? idxB : 999;
          if (cleanIdxA !== cleanIdxB) return cleanIdxA - cleanIdxB;
        }

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

  // ── Client Pagination ─────────────────────────────────────────────────────
  const totalItems = filteredAndSortedEvents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedEvents = useMemo(() => {
    const startIndex = (safePage - 1) * PAGE_SIZE;
    return filteredAndSortedEvents.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredAndSortedEvents, safePage]);

  const clientPagination: PaginationMeta = useMemo(
    () => ({
      count: totalItems,
      totalPages,
      isNext: safePage < totalPages,
      isPrev: safePage > 1,
      nextPage: safePage < totalPages ? safePage + 1 : null,
      pageSize: PAGE_SIZE,
      perPage: PAGE_SIZE,
    }),
    [totalItems, totalPages, safePage],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePageChange = (page: number) => {
    updateUrl({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleSearch = (value: string) => {
    setSearchInput(value);
  };
  const handleSortChange = (value: string) => {
    updateUrl({ sort: value });
  };
  const handleClusterChange = (value: string) => {
    updateUrl({ cluster: value });
  };
  const handleEventTypeChange = (value: string) => {
    updateUrl({ type: value });
  };
  const handlePublisherChange = (value: string) => {
    updateUrl({ publisher: value });
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
            events={paginatedEvents}
            onEventView={(event) =>
              router.push(`/dashboard/events/${event.id}`)
            }
          />
        )}

        {clientPagination && (
          <EventsPagination
            pagination={clientPagination}
            currentPage={safePage}
            onPageChange={handlePageChange}
            currentCount={paginatedEvents.length}
          />
        )}
      </div>
    </main>
  );
}
