"use client";

import { Eye, Lock, MapPin, MoreVertical } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteEvent } from "../hooks";
import type { EventListItem, OrganizerInfo } from "../types";
import { EventStatusBadge } from "./event-status-badge";
import { InterestButton } from "./interest-button";

interface EventCardProps {
  event: EventListItem;
  isManageView?: boolean;
  onDelete?: () => void;
  onEdit?: (event: EventListItem) => void;
  onView?: (event: EventListItem) => void;
}

function getOrganizerName(organizer: OrganizerInfo): string {
  if (organizer.type === "global_ig") {
    return organizer.ig?.name ?? "Global IG";
  }
  if (organizer.type === "campus_ig") {
    return organizer.campus_ig?.ig.name ?? "Campus IG";
  }
  if (organizer.type === "campus") {
    return organizer.campus?.name ?? "Campus";
  }
  if (organizer.type === "company") {
    return organizer.company?.name ?? "Company";
  }
  return "muLearn";
}

export function EventCard({
  event,
  isManageView,
  onDelete,
  onEdit,
  onView,
}: EventCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteEvent = useDeleteEvent(event.id);

  const onDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    setIsDeleting(true);
    try {
      await deleteEvent.mutateAsync();
      onDelete?.();
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(event.start_datetime).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md ${!isManageView ? "cursor-pointer" : ""}`}
      onClick={!isManageView ? () => onView?.(event) : undefined}
      onKeyDown={
        !isManageView
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onView?.(event);
              }
            }
          : undefined
      }
      tabIndex={!isManageView ? 0 : undefined}
      role={!isManageView ? "button" : undefined}
      aria-label={!isManageView ? "View event details" : undefined}
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={event.cover_image ?? "/images/fallback.webp"}
          alt={event.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="absolute left-3 right-3 top-3 flex items-start justify-between">
        <Badge variant="secondary" className="capitalize">
          {event.event_type?.replace(/_/g, " ") ?? ""}
        </Badge>
        {isManageView && <EventStatusBadge status={event.status} />}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <p className="text-xs text-gray-500">{formattedDate}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900">
          {event.title}
        </h3>
        <p className="mt-1 text-xs text-gray-600">
          By {getOrganizerName(event.organizer)}
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-600">
          <MapPin className="h-3.5 w-3.5" />
          <span className="capitalize">
            {event.venue_type}
            {event.venue_city ? ` · ${event.venue_city}` : ""}
          </span>
        </p>

        {event.min_karma != null && (
          <p className="mt-2 inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
            <Lock className="h-3.5 w-3.5" />
            {event.min_karma} karma
          </p>
        )}

        <div className="mt-4 flex items-center justify-between mt-auto">
          {isManageView ? (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{event.interest_count} interested</span>
              {event.is_collaboration && (
                <Badge variant="outline" className="text-xs">
                  Collab
                </Badge>
              )}
            </div>
          ) : (
            <InterestButton
              eventId={event.id}
              status={event.viewer_interest_status}
              count={event.interest_count}
            />
          )}
        </div>
      </div>

      {isManageView && (
        <div className="absolute right-3 top-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-white/90 opacity-0 transition-opacity hover:bg-white group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(event);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(event);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDeleteClick}
                disabled={isDeleting || deleteEvent.isPending}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </article>
  );
}
