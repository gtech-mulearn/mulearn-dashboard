"use client";

// TODO: add RBAC guard — check user role from /api/v1/dashboard/user/info/ before rendering
// The manage endpoint likely requires staff/organiser permissions server-side.
// If the current user doesn't have those permissions, the API returns an empty list or 403.

import { useQueries, useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient, endpoints } from "@/api";
import { ApiError } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { eventsApi } from "../api";
import { MANAGE_EVENT_STATUS_PILLS } from "../constants/events.constants";
import { usePendingCollaboratorInvites } from "../hooks";
import { eventKeys } from "../hooks/query-keys";
import type { EventListItem, EventStatus } from "../types";
import { CollaboratorInvitesSheet } from "./collaborator-invites-sheet";
import { EventCreateWizard } from "./event-create-wizard";
import EventModal from "./event-modal";
import { EventsGrid } from "./events-grid";
import { EventsPagination } from "./events-pagination";

export default function ManageEventsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventListItem | null>(null);
  const [invitesOpen, setInvitesOpen] = useState(false);

  const { data: userInfo } = useQuery({
    queryKey: ["user", "info", "events-manage"],
    queryFn: () => apiClient.get<Record<string, unknown>>(endpoints.user.info),
  });

  const canAdminView = Boolean(
    (userInfo?.is_staff as boolean | undefined) ||
      (Array.isArray(userInfo?.roles) &&
        (userInfo.roles as string[]).some((role) =>
          role.toLowerCase().includes("admin"),
        )),
  );

  const useAdminView = canAdminView;

  const {
    pendingInvites,
    pendingCount: pendingInviteCount,
    isLoading: isInvitesLoading,
    isError: isInvitesError,
  } = usePendingCollaboratorInvites();

  useEffect(() => {
    const statusFromUrl = searchParams.get("status");
    if (!statusFromUrl) return;

    if (
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
      setPage(1);
    }
  }, [searchParams]);

  const listParams = {
    pageIndex: page,
    search: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    perPage: 12,
  };

  const statsQueries = useQueries({
    queries: [
      {
        queryKey: useAdminView
          ? eventKeys.adminList({ pageIndex: 1, perPage: 1 })
          : eventKeys.manageList({ pageIndex: 1, perPage: 1 }),
        queryFn: () =>
          useAdminView
            ? eventsApi.adminList({ pageIndex: 1, perPage: 1 })
            : eventsApi.manageList({ pageIndex: 1, perPage: 1 }),
      },
      {
        queryKey: useAdminView
          ? eventKeys.adminList({
              pageIndex: 1,
              perPage: 1,
              status: "published",
            })
          : eventKeys.manageList({
              pageIndex: 1,
              perPage: 1,
              status: "published",
            }),
        queryFn: () =>
          useAdminView
            ? eventsApi.adminList({
                pageIndex: 1,
                perPage: 1,
                status: "published",
              })
            : eventsApi.manageList({
                pageIndex: 1,
                perPage: 1,
                status: "published",
              }),
      },
      {
        queryKey: useAdminView
          ? eventKeys.adminList({
              pageIndex: 1,
              perPage: 1,
              status: "pending_approval",
            })
          : eventKeys.manageList({
              pageIndex: 1,
              perPage: 1,
              status: "pending_approval",
            }),
        queryFn: () =>
          useAdminView
            ? eventsApi.adminList({
                pageIndex: 1,
                perPage: 1,
                status: "pending_approval",
              })
            : eventsApi.manageList({
                pageIndex: 1,
                perPage: 1,
                status: "pending_approval",
              }),
      },
      {
        queryKey: useAdminView
          ? eventKeys.adminList({ pageIndex: 1, perPage: 1, status: "draft" })
          : eventKeys.manageList({
              pageIndex: 1,
              perPage: 1,
              status: "draft",
            }),
        queryFn: () =>
          useAdminView
            ? eventsApi.adminList({ pageIndex: 1, perPage: 1, status: "draft" })
            : eventsApi.manageList({
                pageIndex: 1,
                perPage: 1,
                status: "draft",
              }),
      },
      {
        queryKey: useAdminView
          ? eventKeys.adminList({
              pageIndex: 1,
              perPage: 1,
              status: "completed",
            })
          : eventKeys.manageList({
              pageIndex: 1,
              perPage: 1,
              status: "completed",
            }),
        queryFn: () =>
          useAdminView
            ? eventsApi.adminList({
                pageIndex: 1,
                perPage: 1,
                status: "completed",
              })
            : eventsApi.manageList({
                pageIndex: 1,
                perPage: 1,
                status: "completed",
              }),
      },
    ],
  });

  const statsLoading = statsQueries.some((query) => query.isLoading);
  const totalCount = statsQueries[0].data?.pagination.count ?? 0;
  const publishedCount = statsQueries[1].data?.pagination.count ?? 0;
  const pendingApprovalCount = statsQueries[2].data?.pagination.count ?? 0;
  const draftCount = statsQueries[3].data?.pagination.count ?? 0;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: useAdminView
      ? eventKeys.adminList(listParams)
      : eventKeys.manageList(listParams),
    queryFn: () =>
      useAdminView
        ? eventsApi.adminList(listParams)
        : eventsApi.manageList(listParams),
  });

  const events = data?.data ?? [];

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    refetch();
  };

  const is403 = error instanceof ApiError && error.status === 403;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-foreground">Manage Events</h1>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setInvitesOpen(true)}
            className="gap-2 border-border text-foreground hover:border-primary hover:text-primary"
          >
            Invites
            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
              {pendingInviteCount}
            </span>
          </Button>
          <Button
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              setEditingEvent(null);
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
            <div className="rounded-2xl border border-border border-l-4 border-l-border bg-card p-5 lc-card-shadow">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Total Events
              </p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {totalCount}
              </p>
            </div>
            <div className="rounded-2xl border border-border border-l-4 border-l-[var(--chart-2)] bg-card p-5 lc-card-shadow">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Published
              </p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {publishedCount}
              </p>
            </div>
            <div className="rounded-2xl border border-border border-l-4 border-l-[var(--chart-4)] bg-card p-5 lc-card-shadow">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Pending Approval
              </p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {pendingApprovalCount}
              </p>
            </div>
            <div className="rounded-2xl border border-border border-l-4 border-l-muted-foreground/40 bg-card p-5 lc-card-shadow">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Drafts
              </p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {draftCount}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {MANAGE_EVENT_STATUS_PILLS.map((pill) => {
          const active = statusFilter === pill.value;
          return (
            <Button
              key={pill.value}
              variant="outline"
              size="sm"
              className={`rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground hover:border-primary hover:text-primary ${
                active
                  ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  : ""
              }`}
              onClick={() => {
                setStatusFilter(pill.value);
                setPage(1);
              }}
            >
              {pill.label}
            </Button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="rounded-xl border-border bg-background pl-9"
            placeholder="Search events"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      ) : isError ? (
        <p className="text-sm text-red-600">
          {is403
            ? "You don't have permission to manage events"
            : error instanceof Error
              ? error.message
              : "Failed to load events"}
        </p>
      ) : (
        <>
          {canAdminView && events.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No events found. If you expected to see events created by other
              admins, ensure you have been added as a co-owner or contact a
              platform admin.
            </p>
          ) : null}
          <EventsGrid
            events={events}
            isManageView
            onEventDeleted={() => refetch()}
            onCreateEvent={() => {
              setEditingEvent(null);
              setIsModalOpen(true);
            }}
            onEventView={(event) => {
              router.push(`/dashboard/manage-events/${event.id}`);
            }}
          />
          <EventsPagination
            pagination={data?.pagination}
            currentPage={page}
            onPageChange={setPage}
            currentCount={events.length}
          />
        </>
      )}

      <EventModal
        open={isModalOpen}
        onClose={handleModalClose}
        initialData={editingEvent}
        isEdit={!!editingEvent}
      />

      <EventCreateWizard
        open={showWizard}
        onClose={() => {
          setShowWizard(false);
          refetch();
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
