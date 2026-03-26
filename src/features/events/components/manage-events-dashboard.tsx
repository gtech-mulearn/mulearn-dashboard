"use client";

// TODO: add RBAC guard — check user role from /api/v1/dashboard/user/info/ before rendering
// The manage endpoint likely requires staff/organiser permissions server-side.
// If the current user doesn't have those permissions, the API returns an empty list or 403.

import { Plus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/api/client";
import { useManageEventsList } from "../hooks";
import type { EventListItem, EventStatus } from "../types";
import EventModal from "./event-modal";
import { EventsFilters } from "./events-filters";
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

      <EventsFilters onSearch={setSearch} />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
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
            onEventEdit={(event) => {
              setEditingEvent(event);
              setIsModalOpen(true);
            }}
            onEventView={(event) => {
              router.push(`/dashboard/events/manage/${event.id}`);
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
