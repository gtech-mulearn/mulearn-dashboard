"use client";

import {
  BookOpen,
  Code,
  Compass,
  Gamepad2,
  Globe,
  Lock,
  type LucideIcon,
  MapPin,
  Trophy,
  Users,
} from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  extractInterestGroups,
  useInterestGroupsList,
} from "@/features/interest-groups";
import { resolveEventTypeValue } from "../hooks";
import type { EventListItem, OrganizerInfo } from "../types";
import { EventStatusBadge } from "./event-status-badge";
import { EventTypeBadge } from "./event-type-badge";
import { InterestButton } from "./interest-button";

const BADGE_CONFIG: Record<
  string,
  { label: string; icon: LucideIcon; className: string }
> = {
  // Clusters
  coder: { label: "Coder", icon: Code, className: "ig-cat-coder" },
  maker: { label: "Maker", icon: Users, className: "ig-cat-maker" },
  creative: { label: "Creative", icon: Compass, className: "ig-cat-creative" },
  manager: { label: "Manager", icon: Trophy, className: "ig-cat-manager" },
  // Event Types
  workshop: { label: "Workshop", icon: BookOpen, className: "ig-cat-manager" },
  webinar: { label: "Webinar", icon: Globe, className: "ig-cat-coder" },
  hackathon: { label: "Hackathon", icon: Code, className: "ig-cat-creative" },
  meetup: { label: "Meetup", icon: Users, className: "ig-cat-maker" },
  competition: {
    label: "Competition",
    icon: Trophy,
    className: "ig-cat-manager",
  },
  social_gathering: {
    label: "Social",
    icon: Gamepad2,
    className: "ig-cat-maker",
  },
};

interface EventCardProps {
  event: EventListItem;
  isManageView?: boolean;
  onDelete?: () => void;
  onEdit?: (event: EventListItem) => void;
  onView?: (event: EventListItem) => void;
}

function getOrganizerName(organizer: OrganizerInfo): string {
  if (!organizer) return "MuLearn";

  const type = organizer.type ?? organizer.organiser_type;

  if (type === "global_ig") {
    const igName = organizer.ig?.name ?? organizer.organiser_ig?.name;
    return igName ?? "Global IG";
  }
  if (type === "campus_ig") {
    const igName = organizer.ig?.name ?? organizer.organiser_ig?.name;
    const campusInfo = organizer.campus ?? organizer.organiser_campus;
    const campusName = campusInfo?.title ?? campusInfo?.name;

    if (igName && campusName) {
      return `${igName} @ ${campusName}`;
    }
    return organizer.campus_ig?.name ?? "Campus IG";
  }
  if (type === "campus") {
    const campusInfo = organizer.campus ?? organizer.organiser_campus;
    return campusInfo?.title ?? campusInfo?.name ?? "Campus";
  }
  if (type === "company") {
    const companyInfo = organizer.company ?? organizer.organiser_company;
    return companyInfo?.title ?? companyInfo?.name ?? "Company";
  }
  if (type === "admin") {
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

  const isEnded = new Date(event.end_datetime).getTime() < Date.now();

  // Fetch interest groups list to map organizer IG IDs to clusters
  const { data: igData } = useInterestGroupsList();
  const interestGroups = igData ? extractInterestGroups(igData) : [];
  const igIdToClusterMap = new Map<string, string>();
  interestGroups.forEach((ig) => {
    if (ig.id && ig.category) {
      igIdToClusterMap.set(ig.id, ig.category.toLowerCase());
    }
  });

  const directCluster =
    event.organizer?.ig?.cluster ||
    event.organizer?.organiser_ig?.cluster ||
    event.organizer?.ig?.category ||
    event.organizer?.organiser_ig?.category;

  const igId =
    event.organizer?.ig?.id ||
    event.organizer?.organiser_ig?.id ||
    event.organizer?.campus_ig?.id;

  const cluster =
    directCluster?.toLowerCase() || (igId ? igIdToClusterMap.get(igId) : null);
  const eventType = resolveEventTypeValue(
    event.event_type,
    event.category_name,
  );
  const displayKey = cluster || (eventType !== "others" ? eventType : null);
  const badge = displayKey ? BADGE_CONFIG[displayKey.toLowerCase()] : null;

  return (
    <article className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card lc-card-shadow transition-all duration-300 hover:-translate-y-1 lc-card-shadow-hover cursor-pointer lc-slide-up">
      {onView ? (
        <button
          type="button"
          className="absolute inset-0 z-20 cursor-pointer"
          onClick={() => onView(event)}
          aria-label="View event details"
        />
      ) : null}

      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={event.cover_image ?? "/images/fallback.webp"}
          alt={event.title}
          fill
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/45 to-transparent" />

        <div className="absolute inset-0 bg-foreground/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute left-3 top-3 z-30">
          {badge ? (
            <Badge className={`${badge.className} font-medium gap-1`}>
              <badge.icon className="h-3 w-3" />
              {badge.label}
            </Badge>
          ) : null}
        </div>

        {isManageView ? (
          <div className="absolute right-3 top-3 z-30">
            <EventStatusBadge status={event.status} />
          </div>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 z-30 p-4 text-primary-foreground">
          <p className="text-[11px] opacity-80">{formattedDate}</p>
          <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-tight">
            {event.title}
          </h3>
          <p className="mt-1 text-xs opacity-85">
            By {getOrganizerName(event.organizer)}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs opacity-85">
            <MapPin className="h-3.5 w-3.5" />
            <span>{venueDisplay}</span>
          </p>

          <div className="mt-3 flex items-center justify-between gap-2">
            {isManageView ? (
              <div className="flex items-center gap-2 text-xs opacity-90">
                <span>{event.interest_count} interested</span>
                {event.is_collaboration ? (
                  <Badge variant="outline">Collab</Badge>
                ) : null}
              </div>
            ) : isEnded ? (
              <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium text-primary-foreground/80 backdrop-blur-sm">
                Event Ended
              </span>
            ) : (
              <div className="relative z-40">
                <InterestButton
                  eventId={event.id}
                  status={event.viewer_interest_status}
                  count={event.interest_count}
                />
              </div>
            )}

            {event.min_karma != null && !isEnded ? (
              <div className="flex items-center gap-1 rounded-md bg-primary-foreground/15 px-2 py-1 text-xs backdrop-blur-sm">
                <Lock className="h-3 w-3" />
                <span>{event.min_karma.toLocaleString()}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
