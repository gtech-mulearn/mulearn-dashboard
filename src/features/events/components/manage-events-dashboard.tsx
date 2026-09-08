"use client";

import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/api/client";
import { SearchBar } from "@/components/dashboard/table/SearchBar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserInfo } from "@/features/auth/hooks";
import { ROLES } from "@/lib/auth/roles";
import { eventsApi } from "../api";
import {
  EVENT_SORT_DEFAULT,
  EVENT_SORT_OPTIONS,
  MANAGE_EVENT_STATUS_PILLS,
} from "../constants/events.constants";
import { usePendingCollaboratorInvites } from "../hooks";
import { eventKeys } from "../hooks/query-keys";
import {
  getEventPublisherName,
  getPublisherBucket,
  sortEventsByPublisher,
} from "../lib/events.publisher";
import type { EventListQueryParams, EventStatus } from "../types";
import { CollaboratorInvitesSheet } from "./collaborator-invites-sheet";
import { EventCreateWizard } from "./event-create-wizard";
import { EventsGrid } from "./events-grid";
import { EventsPagination } from "./events-pagination";

function makeEventQuery(isAdmin: boolean, params: EventListQueryParams) {
  return {
    queryKey: isAdmin
      ? eventKeys.adminList(params as Record<string, unknown>)
      : eventKeys.manageList(params),
    queryFn: () =>
      isAdmin ? eventsApi.adminList(params) : eventsApi.manageList(params),
  };
}

interface ManageEventsFilterCache {
  search?: string;
  status?: EventStatus | "all";
  publisher?: string;
  sortBy?: string;
  page?: number;
}

let cachedManageEventsFilters: ManageEventsFilterCache | null = null;

export default function ManageEventsDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(() => {
    const p = Number(searchParams.get("page"));
    if (p > 0) return p;
    return cachedManageEventsFilters?.page ?? 1;
  });

  const [search, setSearch] = useState(() => {
    return searchParams.get("q") ?? cachedManageEventsFilters?.search ?? "";
  });

  const [sortBy, setSortBy] = useState<string>(() => {
    return (
      searchParams.get("sort") ??
      cachedManageEventsFilters?.sortBy ??
      EVENT_SORT_DEFAULT
    );
  });

  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">(() => {
    const fromUrl = searchParams.get("status") as EventStatus | "all" | null;
    return fromUrl ?? cachedManageEventsFilters?.status ?? "all";
  });

  const [selectedPublisher, setSelectedPublisher] = useState<string>(() => {
    return (
      searchParams.get("publisher") ??
      cachedManageEventsFilters?.publisher ??
      "all"
    );
  });

  const [showWizard, setShowWizard] = useState(false);
  const [invitesOpen, setInvitesOpen] = useState(false);

  const { data: userInfo, isLoading: isUserInfoLoading } = useUserInfo();

  const viewerRoles = Array.isArray(userInfo?.roles)
    ? (userInfo.roles as string[])
    : [];

  const canAdminView =
    !isUserInfoLoading &&
    (viewerRoles.includes(ROLES.ADMIN) ||
      viewerRoles.includes("Admin") ||
      viewerRoles.includes("Super Admin"));

  const isMentor = viewerRoles.includes(ROLES.MENTOR);
  const isCampusLead = [
    ROLES.CAMPUS_LEAD,
    ROLES.ZONAL_CAMPUS_LEAD,
    ROLES.DISTRICT_CAMPUS_LEAD,
  ].some((role) => viewerRoles.includes(role));

  // Base status pills + role-gated approval-queue pills (EV-B). Mentors get
  // their mentor-approval queue; campus leads get the campus-approval queue.
  const statusPills: Array<{ label: string; value: EventStatus | "all" }> = [
    ...MANAGE_EVENT_STATUS_PILLS,
    ...(isMentor
      ? [
          {
            label: "Pending my approval",
            value: "pending_mentor_approval" as const,
          },
        ]
      : []),
    ...(isCampusLead
      ? [
          {
            label: "Pending campus approval",
            value: "pending_campus_approval" as const,
          },
        ]
      : []),
  ];

  const {
    pendingInvites,
    pendingCount: pendingInviteCount,
    isLoading: isInvitesLoading,
    isError: isInvitesError,
  } = usePendingCollaboratorInvites();

  // Sync state when URL params change
  useEffect(() => {
    const statusFromUrl = searchParams.get("status") as
      | EventStatus
      | "all"
      | null;
    if (
      statusFromUrl === "all" ||
      statusFromUrl === "draft" ||
      statusFromUrl === "pending_campus_approval" ||
      statusFromUrl === "pending_approval" ||
      statusFromUrl === "pending_mentor_approval" ||
      statusFromUrl === "published" ||
      statusFromUrl === "ongoing" ||
      statusFromUrl === "completed" ||
      statusFromUrl === "cancelled"
    ) {
      setStatusFilter(statusFromUrl);
    }
  }, [searchParams]);

  // Sync URL & in-memory cache for persistence
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (statusFilter && statusFilter !== "all")
      params.set("status", statusFilter);
    if (selectedPublisher && selectedPublisher !== "all")
      params.set("publisher", selectedPublisher);
    if (sortBy && sortBy !== EVENT_SORT_DEFAULT) params.set("sort", sortBy);
    if (page > 1) params.set("page", String(page));

    const nextQs = params.toString();
    const currentQs = searchParams.toString();
    if (nextQs !== currentQs) {
      const qs = nextQs ? `?${nextQs}` : "";
      router.replace(`/dashboard/manage-events${qs}`, { scroll: false });
    }

    cachedManageEventsFilters = {
      search,
      status: statusFilter,
      publisher: selectedPublisher,
      sortBy,
      page,
    };
  }, [
    search,
    statusFilter,
    selectedPublisher,
    sortBy,
    page,
    router,
    searchParams,
  ]);

  const listParams: EventListQueryParams = {
    pageIndex: page,
    search: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    sortBy: sortBy.startsWith("publisher_") ? EVENT_SORT_DEFAULT : sortBy,
    perPage: 12,
  };

  const statsQueries = useQueries({
    queries: [
      makeEventQuery(canAdminView, { pageIndex: 1, perPage: 1 }),
      makeEventQuery(canAdminView, {
        pageIndex: 1,
        perPage: 1,
        status: "published",
      }),
      makeEventQuery(canAdminView, {
        pageIndex: 1,
        perPage: 1,
        status: "pending_approval",
      }),
      makeEventQuery(canAdminView, {
        pageIndex: 1,
        perPage: 1,
        status: "draft",
      }),
      makeEventQuery(canAdminView, {
        pageIndex: 1,
        perPage: 1,
        status: "completed",
      }),
    ],
  });

  const statsLoading = statsQueries.some((query) => query.isLoading);
  const totalCount = statsQueries[0].data?.pagination.count ?? 0;
  const publishedCount = statsQueries[1].data?.pagination.count ?? 0;
  const pendingApprovalCount = statsQueries[2].data?.pagination.count ?? 0;
  const draftCount = statsQueries[3].data?.pagination.count ?? 0;

  const { data, isLoading, isError, error } = useQuery(
    makeEventQuery(canAdminView, listParams),
  );

  const events = data?.data ?? [];

  const publisherBucket = useMemo(() => getPublisherBucket(events), [events]);

  const filteredAndSortedEvents = useMemo(() => {
    let result = [...events];

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
    }

    return result;
  }, [events, selectedPublisher, sortBy]);

  const is403 = error instanceof ApiError && error.status === 403;

  const handleEventDeleted = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: eventKeys.all });
  }, [queryClient]);
  const handleCreateEvent = useCallback(() => setShowWizard(true), []);
  const handleEventView = useCallback(
    (event: { id: string }) =>
      router.push(`/dashboard/manage-events/${event.id}`),
    [router],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-foreground">Manage Events</h1>
        <div className="flex items-center gap-2">
          {pendingInviteCount > 0 ? (
            <Button
              variant="outline"
              onClick={() => setInvitesOpen(true)}
              className="gap-2"
            >
              Invites
              <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                {pendingInviteCount}
              </span>
            </Button>
          ) : null}
          <Button
            onClick={() => {
              setShowWizard(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {statsLoading ? (
          <>
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setPage(1);
              }}
              className="rounded-2xl border border-border bg-card p-5 text-left lc-card-shadow transition-colors hover:bg-muted/50"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Total Events
              </p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {totalCount}
              </p>
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("published");
                setPage(1);
              }}
              className="rounded-2xl border border-border bg-card p-5 text-left lc-card-shadow transition-colors hover:bg-muted/50"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Published
              </p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {publishedCount}
              </p>
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("pending_approval");
                setPage(1);
              }}
              className="rounded-2xl border border-border bg-card p-5 text-left lc-card-shadow transition-colors hover:bg-muted/50"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Pending Approval
              </p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {pendingApprovalCount}
              </p>
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("draft");
                setPage(1);
              }}
              className="rounded-2xl border border-border bg-card p-5 text-left lc-card-shadow transition-colors hover:bg-muted/50"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Drafts
              </p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {draftCount}
              </p>
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as EventStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full md:w-56 rounded-full">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusPills.map((pill) => (
              <SelectItem key={pill.value} value={pill.value}>
                {pill.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedPublisher}
          onValueChange={(value) => {
            setSelectedPublisher(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full md:w-52 rounded-full">
            <SelectValue placeholder="All Publishers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Publishers</SelectItem>
            {publisherBucket.map((pub) => (
              <SelectItem key={pub} value={pub}>
                {pub}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(value) => {
            setSortBy(value);
            setPage(1);
          }}
        >
          <SelectTrigger
            className="w-full rounded-full md:w-44"
            aria-label="Sort events"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EVENT_SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <SearchBar
          onSearch={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search events"
          size="md"
          showButton={false}
          className="w-full md:max-w-md md:ml-auto"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">
          {is403
            ? "You don't have permission to manage events"
            : process.env.NODE_ENV === "development" && error instanceof Error
              ? error.message
              : "Failed to load events"}
        </p>
      ) : (
        <>
          <EventsGrid
            events={filteredAndSortedEvents}
            isManageView
            onEventDeleted={handleEventDeleted}
            onCreateEvent={handleCreateEvent}
            onEventView={handleEventView}
            emptyTitle={
              totalCount === 0 ? "No events yet" : "No matching events"
            }
            emptyDescription={
              totalCount === 0
                ? canAdminView
                  ? "No events found. If you expected to see events created by other admins, ensure you have been added as a co-owner or contact a platform admin."
                  : "Create your first event to get your dashboard rolling."
                : "No events match the current filters. Try selecting a different status or adjusting your search."
            }
          />
          <EventsPagination
            pagination={data?.pagination}
            currentPage={page}
            onPageChange={setPage}
            currentCount={filteredAndSortedEvents.length}
          />
        </>
      )}

      <EventCreateWizard
        open={showWizard}
        onClose={() => {
          setShowWizard(false);
          queryClient.invalidateQueries({ queryKey: eventKeys.all });
        }}
      />

      <CollaboratorInvitesSheet
        open={invitesOpen}
        onOpenChange={setInvitesOpen}
        invites={pendingInvites}
        isLoading={isInvitesLoading}
        isError={isInvitesError}
        onOpenEvent={(eventId) => {
          setInvitesOpen(false);
          router.push(`/dashboard/manage-events/${eventId}`);
        }}
      />
    </div>
  );
}
