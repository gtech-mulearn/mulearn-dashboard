"use client";

import { Lock, MapPin } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { EventListItem, OrganizerInfo } from "../types";
import { EventStatusBadge } from "./event-status-badge";
import { EventTypeBadge } from "./event-type-badge";
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
    if (organizer.ig?.name && organizer.campus?.name) {
      return `${organizer.ig.name} @ ${organizer.campus.name}`;
    }
    return organizer.campus_ig?.name ?? "Campus IG";
  }
  if (organizer.type === "campus") {
    return organizer.campus?.name ?? "Campus";
  }
  if (organizer.type === "company") {
    return organizer.company?.name ?? "Company";
  }
  return "muLearn";
}

export function EventCard({ event, isManageView, onView }: EventCardProps) {
  const formattedDate = new Date(event.start_datetime).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {onView ? (
        <button
          type="button"
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={() => onView(event)}
          aria-label="View event details"
        />
      ) : null}
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={event.cover_image ?? "/images/fallback.webp"}
          alt={event.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <EventTypeBadge eventType={event.event_type} />
        </div>
        {isManageView ? (
          <div className="absolute right-3 top-3">
            <EventStatusBadge status={event.status} />
          </div>
        ) : null}
      </div>

      <div className="relative z-20 p-4 flex-1 flex flex-col">
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

          {event.min_karma != null ? (
            <p className="bg-gray-100 text-gray-700 rounded px-2 py-0.5 text-xs flex items-center gap-1">
              <Lock className="h-3 w-3" />
              {event.min_karma.toLocaleString()} karma
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
