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
import type {
  EventListQueryParams,
  EventStatus,
  PaginationMeta,
} from "../types";
import { CollaboratorInvitesSheet } from "./collaborator-invites-sheet";
import { EventCreateWizard } from "./event-create-wizard";
import { EventsGrid } from "./events-grid";
import { EventsPagination } from "./events-pagination";

const FETCH_ALL_LIMIT = 200;
const PAGE_SIZE = 12;

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

  // Derive filter values directly from URL searchParams to eliminate history overwrite race conditions
  const searchParamQ = searchParams.get("q") ?? "";
  const statusFilter =
    (searchParams.get("status") as EventStatus | "all" | null) ?? "all";
  const selectedPublisher = searchParams.get("publisher") ?? "all";
  const sortBy = searchParams.get("sort") ?? EVENT_SORT_DEFAULT;
  const page =
    Number(searchParams.get("page")) > 0 ? Number(searchParams.get("page")) : 1;

  const [showWizard, setShowWizard] = useState(false);
  const [invitesOpen, setInvitesOpen] = useState(false);

  const { data: userInfo, isLoading: isUserInfoLoading } = useUserInfo();

  const viewerRoles = Array.isArray(userInfo?.roles)
    ? (userInfo.roles as string[])
    : [];

  const canAdminView = !isUserInfoLoading && viewerRoles.includes(ROLES.ADMIN);

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

  // Restore cached filters on initial mount if URL is empty
  useEffect(() => {
    if (!searchParams.toString() && cachedManageEventsFilters) {
      const params = new URLSearchParams();
      if (cachedManageEventsFilters.search)
        params.set("q", cachedManageEventsFilters.search);
      if (
        cachedManageEventsFilters.status &&
        cachedManageEventsFilters.status !== "all"
      )
        params.set("status", cachedManageEventsFilters.status);
      if (
        cachedManageEventsFilters.publisher &&
        cachedManageEventsFilters.publisher !== "all"
      )
        params.set("publisher", cachedManageEventsFilters.publisher);
      if (
        cachedManageEventsFilters.sortBy &&
        cachedManageEventsFilters.sortBy !== EVENT_SORT_DEFAULT
      )
        params.set("sort", cachedManageEventsFilters.sortBy);
      if (cachedManageEventsFilters.page && cachedManageEventsFilters.page > 1)
        params.set("page", String(cachedManageEventsFilters.page));

      const qs = params.toString();
      if (qs) {
        router.replace(`/dashboard/manage-events?${qs}`, { scroll: false });
      }
    }
  }, [searchParams, router]);

  // Keep in-memory cache synchronized with URL
  useEffect(() => {
    cachedManageEventsFilters = {
      search: searchParams.get("q") ?? "",
      status:
        (searchParams.get("status") as EventStatus | "all" | null) ?? "all",
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
      if (!("page" in updates)) {
        params.delete("page");
      }
      const qs = params.toString();
      const currentQs = searchParams.toString();
      if (qs !== currentQs) {
        router.replace(`/dashboard/manage-events${qs ? `?${qs}` : ""}`, {
          scroll: false,
        });
      }
    },
    [searchParams, router],
  );

  const listParams: EventListQueryParams = {
    pageIndex: 1,
    perPage: FETCH_ALL_LIMIT,
    search: searchParamQ || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    sortBy: sortBy.startsWith("publisher_") ? EVENT_SORT_DEFAULT : sortBy,
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

  // Global publisher extraction across complete collection
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

  // Client pagination across complete collection
  const totalItems = filteredAndSortedEvents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);

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
                updateUrl({ status: "all" });
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
                updateUrl({ status: "published" });
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
                updateUrl({ status: "pending_approval" });
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
                updateUrl({ status: "draft" });
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
            updateUrl({ status: value });
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
            updateUrl({ publisher: value });
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
            updateUrl({ sort: value });
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
          defaultValue={searchParamQ}
          onSearch={(val) => {
            updateUrl({ q: val });
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
            events={paginatedEvents}
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
            pagination={clientPagination}
            currentPage={safePage}
            onPageChange={(p) => {
              updateUrl({ page: p });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            currentCount={paginatedEvents.length}
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
