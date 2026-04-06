"use client";

import { Lock, MapPin } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { resolveEventTypeValue } from "../hooks";
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
    const igName = organizer.ig?.name;
    const campusName = organizer.campus?.title ?? organizer.campus?.name;
    if (igName && campusName) {
      return `${igName} @ ${campusName}`;
    }
    return organizer.campus_ig?.name ?? "Campus IG";
  }
  if (organizer.type === "campus") {
    return organizer.campus?.title ?? organizer.campus?.name ?? "Campus";
  }
  if (organizer.type === "company") {
    return organizer.company?.title ?? organizer.company?.name ?? "Company";
  }
  if (organizer.type === "admin") {
    return "MuLearn";
  }
  return "MuLearn";
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

  const venueDisplay =
    event.venue_type === "online"
      ? "Online Event"
      : event.venue_city
        ? event.venue_city
        : "Venue TBA";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card lc-card-shadow transition-all duration-300 hover:-translate-y-1 lc-card-shadow-hover cursor-pointer lc-slide-up">
      {onView ? (
        <button
          type="button"
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={() => onView(event)}
          aria-label="View event details"
        />
      ) : null}

      {/* Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={event.cover_image ?? "/images/fallback.webp"}
          alt={event.title}
          fill
          className="object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent" />

        {/* Hover Preview Overlay */}
        <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 text-primary-foreground text-sm font-medium">
          <span>{formattedDate}</span>
          <span className="text-xs opacity-90">{venueDisplay}</span>
        </div>

        {/* Event Type Badge - Bottom Left */}
        <div className="absolute bottom-3 left-3 z-20">
          <EventTypeBadge
            eventType={resolveEventTypeValue(
              event.event_type,
              event.category_name,
            )}
          />
        </div>

        {/* Status Badge - Top Right (Manage View Only) */}
        {isManageView ? (
          <div className="absolute right-3 top-3 z-20">
            <EventStatusBadge status={event.status} />
          </div>
        ) : null}
      </div>

      {/* Content Area */}
      <div className="relative z-20 p-4 flex-1 flex flex-col">
        {/* Date */}
        <p className="text-xs text-muted-foreground">{formattedDate}</p>

        {/* Title */}
        <h3 className="mt-1 line-clamp-2 text-sm font-bold text-foreground">
          {event.title}
        </h3>

        {/* Organizer */}
        <p className="mt-1 text-xs text-muted-foreground">
          By {getOrganizerName(event.organizer)}
        </p>

        {/* Location */}
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="capitalize">
            {event.venue_type}
            {event.venue_city ? ` · ${event.venue_city}` : ""}
          </span>
        </p>

        {/* Bottom Row - Interest Button & Karma Badge */}
        <div className="mt-auto pt-3 flex items-center justify-between">
          {isManageView ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{event.interest_count} interested</span>
              {event.is_collaboration && (
                <Badge
                  variant="outline"
                  className="text-xs border-border text-muted-foreground"
                >
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
            <div className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs flex items-center gap-1">
              <Lock className="h-3 w-3" />
              <span>{event.min_karma.toLocaleString()} karma</span>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
