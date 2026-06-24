"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { EventListItem, EventType } from "@/features/events";
import {
  EventsFilters,
  EventsGrid,
  EventsPagination,
  FeaturedEventsCarousel,
  useEventsList,
  useEventTypeScope,
} from "@/features/events";
import {
  extractInterestGroups,
  useInterestGroupsList,
} from "@/features/interest-groups";
import { useDebounce } from "@/hooks/use-debounce";

// Normalise a string to a slug for comparison (e.g. "Cultural Event" → "cultural_event")
function toSlug(s?: string | null) {
  return s?.trim().toLowerCase().replace(/[\s-]+/g, "_") ?? "";
}

export function EventsPageClient() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCluster, setSelectedCluster] = useState<string>("all");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const debouncedSearch = useDebounce(search, 300);

  // ── Types and Scopes API ──────────────────────────────────────────────────
  const { data: typeScopeData, isLoading: isLoadingTypeScope } = useEventTypeScope();

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

  // ── Event-type / category options (from event-type-scope API) ─────────────
  const eventTypeOptions = useMemo(() => {
    const list =
      typeScopeData && Array.isArray(typeScopeData.event_type)
        ? typeScopeData.event_type
        : [
            "Hackathon", "Workshop", "Webinar", "Seminar", "Bootcamp", "Meetup",
            "Conference", "Competition", "Ideathon", "Cultural event",
            "Sports event", "Community event", "Expo", "Networking event",
            "Tech talk", "Others"
          ];
    return [
      { label: "All Types", value: "all" },
      ...list.map((type) => ({
        label: type,
        value: toSlug(type),
      })),
    ];
  }, [typeScopeData]);

  // ── IG id → cluster map (fallback for events without event_scope) ─────────
  const { data: igData } = useInterestGroupsList();
  const igIdToClusterMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const ig of igData ? extractInterestGroups(igData) : []) {
      if (ig.id && ig.category) map.set(ig.id, ig.category.toLowerCase());
    }
    return map;
  }, [igData]);

  // Resolve the cluster slug for any event
  const getEventCluster = useMemo(
    () =>
      (event: EventListItem): string | null => {
        const org = event.organizer;
        const raw =
          event.event_scope ||
          org?.ig?.cluster ||
          org?.organiser_ig?.cluster ||
          org?.ig?.category ||
          org?.organiser_ig?.category;

        if (raw) return raw.trim().toLowerCase();

        const igId =
          org?.ig?.id || org?.organiser_ig?.id || org?.campus_ig?.id;
        return igId ? (igIdToClusterMap.get(igId) ?? null) : null;
      },
    [igIdToClusterMap],
  );

  // ── Sort-order arrays ─────────────────────────────────────────────────────
  const categoryOrder = useMemo(
    () => clusterList.filter((c) => c.value !== "all").map((c) => c.value),
    [clusterList],
  );
  const eventTypeOrder = useMemo(
    () => eventTypeOptions.filter((t) => t.value !== "all").map((t) => t.value),
    [eventTypeOptions],
  );

  // ── Data fetch ────────────────────────────────────────────────────────────
  // When filtering is active we fetch a bigger page so the client-side filter
  // has enough events to work with (the base endpoint may not honour cluster).
  const isFiltering = selectedCluster !== "all" || selectedEventType !== "all";

  const { data, isLoading } = useEventsList({
    pageIndex: isFiltering ? 1 : currentPage,
    search: debouncedSearch || undefined,
    status: "published",
    sortBy: "-created_at",
    perPage: isFiltering ? 100 : 12,
  });

  const events = data?.data ?? [];
  const pagination = data?.pagination;

  // ── Client-side filter ────────────────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Cluster filter: use event_scope → organiser IG fields → IG map lookup
    if (selectedCluster !== "all") {
      const target = selectedCluster.toLowerCase();
      result = result.filter((ev) => getEventCluster(ev) === target);
    }

    // Event-type filter: match category_name slug OR event_type slug
    if (selectedEventType !== "all") {
      const target = selectedEventType.toLowerCase();
      result = result.filter((ev) => {
        const fromCategory = toSlug(ev.category_name);
        const fromType = toSlug(ev.event_type);
        return fromCategory === target || fromType === target;
      });
    }

    return result;
  }, [events, selectedCluster, selectedEventType, getEventCluster]);

  // ── Client-side sort: most recent first (by creation time if available, fallback to start_datetime) ──
  const sortedEvents = useMemo(() => {
    const result = [...filteredEvents];

    result.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at) : new Date(a.start_datetime);
      const dateB = b.created_at ? new Date(b.created_at) : new Date(b.start_datetime);
      return dateB.getTime() - dateA.getTime();
    });

    return result;
  }, [filteredEvents]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleSearch = (value: string) => { setSearch(value); currentPage !== 1 && setCurrentPage(1); };
  const handleClusterChange = (value: string) => { setSelectedCluster(value); setCurrentPage(1); };
  const handleEventTypeChange = (value: string) => { setSelectedEventType(value); setCurrentPage(1); };

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
            onEventView={(event) => router.push(`/dashboard/events/${event.id}`)}
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
