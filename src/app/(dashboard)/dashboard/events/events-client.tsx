"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EventsFilters,
  EventsGrid,
  EventsPagination,
  FeaturedEventsCarousel,
  useEventsList,
  useEventTypeScope,
  resolveEventTypeValue,
} from "@/features/events";
import type { EventListItem } from "@/features/events";

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
        value: toSlug(type),
      })),
    ];
  }, [typeScopeData]);

  // ── Sort-order arrays ─────────────────────────────────────────────────────
  const categoryOrder = useMemo(
    () => clusterList.filter((c) => c.value !== "all").map((c) => c.value),
    [clusterList],
  );
  const eventTypeOrder = useMemo(
    () => eventTypeOptions.filter((t) => t.value !== "all").map((t) => t.value),
    [eventTypeOptions],
  );

  // ── Data fetch — all filtering delegated to the server ────────────────────
  const { data, isLoading } = useEventsList({
    pageIndex: currentPage,
    search: search || undefined,
    status: "published",
    sortBy: "-created_at",
    perPage: 12,
    event_scope: selectedCluster !== "all" ? selectedCluster : undefined,
    event_type: selectedEventType !== "all" ? selectedEventType : undefined,
  });

  const events = data?.data ?? [];
  const pagination = data?.pagination;

  // ── Client-side sort: cluster → event type → start_datetime desc ──────────
  const sortedEvents = useMemo(() => {
    const result = [...events];
    result.sort((a, b) => {
      // 1. Sort by cluster (event scope) if selectedCluster is "all"
      if (selectedCluster === "all") {
        const getClusterIndex = (event: EventListItem) => {
          const rawCluster =
            event.event_scope ||
            event.organizer?.ig?.cluster ||
            event.organizer?.organiser_ig?.cluster ||
            event.organizer?.ig?.category ||
            event.organizer?.organiser_ig?.category;

          if (rawCluster) {
            const idx = categoryOrder.indexOf(rawCluster.toLowerCase());
            if (idx !== -1) return idx;
          }
          return 999;
        };
        const idxA = getClusterIndex(a);
        const idxB = getClusterIndex(b);
        if (idxA !== idxB) return idxA - idxB;
      }

      // 2. Sort by event type if selectedEventType is "all"
      if (selectedEventType === "all") {
        const getEventTypeIndex = (event: EventListItem) => {
          const typeSlug = resolveEventTypeValue(event.event_type, event.category_name);
          if (typeSlug) {
            const idx = eventTypeOrder.indexOf(typeSlug);
            if (idx !== -1) return idx;
          }
          return 999;
        };
        const idxA = getEventTypeIndex(a);
        const idxB = getEventTypeIndex(b);
        if (idxA !== idxB) return idxA - idxB;
      }

      // 3. Fallback to start_datetime desc
      const dateA = new Date(a.start_datetime).getTime();
      const dateB = new Date(b.start_datetime).getTime();
      return dateB - dateA;
    });
    return result;
  }, [events, selectedCluster, selectedEventType, categoryOrder, eventTypeOrder]);

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
