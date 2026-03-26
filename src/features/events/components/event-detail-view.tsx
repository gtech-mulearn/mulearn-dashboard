"use client";

import { Clock, MapPin, Monitor, Star } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEventDetail } from "../hooks";
import { EventStatusBadge } from "./event-status-badge";
import { InterestButton } from "./interest-button";

interface EventDetailViewProps {
  eventId: string;
}

function organizerLabel(type: string): string {
  return type.replace(/_/g, " ");
}

function countdownLabel(deadline: string | null): string | null {
  if (!deadline) return null;
  const target = new Date(deadline).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return "Registration closed";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  return `${days}d left`;
}

export function EventDetailView({ eventId }: EventDetailViewProps) {
  const { data: event, isLoading, isError, error } = useEventDetail(eventId);

  const countdown = useMemo(
    () => (event ? countdownLabel(event.registration_deadline) : null),
    [event],
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-7 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <p className="text-sm text-red-600">
        {error instanceof Error ? error.message : "Failed to load event"}
      </p>
    );
  }

  const organizerName =
    event.organizer.ig?.name ??
    event.organizer.campus_ig?.ig.name ??
    event.organizer.campus?.name ??
    event.organizer.company?.name ??
    "muLearn";

  const organizerLogo =
    event.organizer.ig?.logo ??
    event.organizer.campus_ig?.ig.logo ??
    event.organizer.campus?.logo ??
    event.organizer.company?.logo ??
    null;

  const acceptedCollaborators = event.collaborators.filter(
    (collab) => collab.invite_status === "accepted",
  );

  return (
    <div className="space-y-6">
      <div
        className="relative w-full overflow-hidden rounded-xl"
        style={{ aspectRatio: "16/5" }}
      >
        {event.banner_image || event.cover_image ? (
          <Image
            src={
              event.banner_image ?? event.cover_image ?? "/images/fallback.webp"
            }
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 to-slate-700/40" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <EventStatusBadge status={event.status} />
        <Badge variant="secondary" className="capitalize">
          {event.event_type?.replace(/_/g, " ")}
        </Badge>
        {event.is_featured ? (
          <Badge className="bg-amber-100 text-amber-800">
            <Star className="mr-1 h-3.5 w-3.5" /> Featured
          </Badge>
        ) : null}
      </div>

      <h1 className="text-3xl font-bold">{event.title}</h1>

      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
        <Clock className="h-4 w-4" />
        <span>{new Date(event.start_datetime).toLocaleString()}</span>
        <span>to</span>
        <span>{new Date(event.end_datetime).toLocaleString()}</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Venue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(event.venue.type === "physical" ||
            event.venue.type === "hybrid") && (
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.venue.address ?? "Address not provided"}
              {event.venue.city ? `, ${event.venue.city}` : ""}
            </p>
          )}
          {(event.venue.type === "online" || event.venue.type === "hybrid") && (
            <p className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              {event.venue.platform ?? "Online"}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organizer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {organizerLogo ? (
              <Image
                src={organizerLogo}
                alt={organizerName}
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold">
                {organizerName.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-medium">{organizerName}</p>
              <p className="text-xs capitalize text-gray-500">
                {organizerLabel(event.organizer.type)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {event.registration_url ? (
            <Button asChild disabled={!event.viewer_can_access_registration}>
              <a href={event.registration_url} target="_blank" rel="noreferrer">
                Register Now
              </a>
            </Button>
          ) : (
            <p className="text-sm text-gray-500">
              Registration link unavailable
            </p>
          )}
          {!event.viewer_can_access_registration &&
          event.viewer_access_blocked_reason ? (
            <p className="text-xs text-red-600">
              {event.viewer_access_blocked_reason}
            </p>
          ) : null}
          {countdown ? (
            <p className="text-xs text-gray-500">Deadline: {countdown}</p>
          ) : null}
        </CardContent>
      </Card>

      <InterestButton
        eventId={event.id}
        status={event.viewer_interest_status}
        count={event.interest_count}
      />

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
            {event.description}
          </p>
        </CardContent>
      </Card>

      {event.linked_tasks.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Linked Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {event.linked_tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded border p-2"
              >
                <span className="text-sm">{task.title}</span>
                <Badge variant="outline">{task.karma} karma</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {acceptedCollaborators.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Collaborators</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {acceptedCollaborators.map((collab) => {
              const name =
                collab.ig?.name ??
                collab.campus?.name ??
                collab.campus_ig?.ig.name ??
                collab.company?.name ??
                "Collaborator";
              return (
                <div key={collab.id} className="rounded border p-2 text-sm">
                  <p className="font-medium">{name}</p>
                  <p className="text-xs capitalize text-gray-500">
                    {collab.collaborator_type.replace(/_/g, " ")}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
