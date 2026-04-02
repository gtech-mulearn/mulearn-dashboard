"use client";

// TODO: add RBAC guard — check user role from /api/v1/dashboard/user/info/ before rendering
// The manage endpoint likely requires staff/organiser permissions server-side.
// If the current user doesn't have those permissions, the API returns an empty list or 403.

import { useQueries } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { eventsApi } from "../api";
import { useManageEventsList } from "../hooks";
import { eventKeys } from "../hooks/query-keys";
import type { EventListItem, EventStatus } from "../types";
import EventModal from "./event-modal";
import { EventsGrid } from "./events-grid";
import { EventsPagination } from "./events-pagination";

const statusPills: Array<{ label: string; value: EventStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Pending", value: "pending_approval" },
  { label: "Published", value: "published" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export default function ManageEventsDashboard() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventListItem | null>(null);

  const statsQueries = useQueries({
    queries: [
      {
        queryKey: eventKeys.manageList({ page: 1, perPage: 1 }),
        queryFn: () => eventsApi.manageList({ page: 1, perPage: 1 }),
      },
      {
        queryKey: eventKeys.manageList({
          page: 1,
          perPage: 1,
          status: "published",
        }),
        queryFn: () =>
          eventsApi.manageList({ page: 1, perPage: 1, status: "published" }),
      },
      {
        queryKey: eventKeys.manageList({
          page: 1,
          perPage: 1,
          status: "pending_approval",
        }),
        queryFn: () =>
          eventsApi.manageList({
            page: 1,
            perPage: 1,
            status: "pending_approval",
          }),
      },
      {
        queryKey: eventKeys.manageList({
          page: 1,
          perPage: 1,
          status: "draft",
        }),
        queryFn: () =>
          eventsApi.manageList({ page: 1, perPage: 1, status: "draft" }),
      },
      {
        queryKey: eventKeys.manageList({
          page: 1,
          perPage: 1,
          status: "completed",
        }),
        queryFn: () =>
          eventsApi.manageList({ page: 1, perPage: 1, status: "completed" }),
      },
    ],
  });

  const statsLoading = statsQueries.some((query) => query.isLoading);
  const totalCount = statsQueries[0].data?.pagination.count ?? 0;
  const publishedCount = statsQueries[1].data?.pagination.count ?? 0;
  const pendingCount = statsQueries[2].data?.pagination.count ?? 0;
  const draftCount = statsQueries[3].data?.pagination.count ?? 0;

  const { data, isLoading, isError, error, refetch } = useManageEventsList({
    page,
    search: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    perPage: 12,
  });

  const events = data?.data ?? [];

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    refetch();
  };

  const is403 = error instanceof ApiError && error.status === 403;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Events</h1>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading ? (
          <>
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </>
        ) : (
          <>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">Total Events</p>
              <p className="mt-1 text-2xl font-semibold">{totalCount}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">Published</p>
              <p className="mt-1 text-2xl font-semibold">{publishedCount}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">Pending Approval</p>
              <p className="mt-1 text-2xl font-semibold">{pendingCount}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">Drafts</p>
              <p className="mt-1 text-2xl font-semibold">{draftCount}</p>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {statusPills.map((pill) => {
          const active = statusFilter === pill.value;
          return (
            <Button
              key={pill.value}
              variant={active ? "default" : "outline"}
              size="sm"
              className={
                active ? "bg-pink-600 hover:bg-pink-700 text-white" : ""
              }
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
        <Input
          className="md:max-w-md"
          placeholder="Search events"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <Button
          onClick={() => {
            setEditingEvent(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
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
    </div>
  );
}
