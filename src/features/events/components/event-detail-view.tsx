"use client";

import {
  AlertTriangle,
  CalendarDays,
  Clock,
  MapPin,
  Monitor,
  Star,
} from "lucide-react";
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
  showInterestButton?: boolean;
  layout?: "full" | "content-only";
}

function organizerLabel(type: string): string {
  return type.replace(/_/g, " ");
}

function countdownLabel(
  deadline: string | null,
): { label: string; urgent: boolean } | null {
  if (!deadline) return null;
  const target = new Date(deadline).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return { label: "Registration closed", urgent: true };

  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 24) {
    return {
      label: `Registration closes in ${hours}h`,
      urgent: true,
    };
  }

  const days = Math.floor(hours / 24);
  return {
    label: `Registration closes in ${days} days`,
    urgent: days < 3,
  };
}

export function EventDetailView({
  eventId,
  showInterestButton = true,
  layout = "full",
}: EventDetailViewProps) {
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
    (event.organizer.ig && event.organizer.campus
      ? `${event.organizer.ig.name} @ ${event.organizer.campus.name}`
      : null) ??
    event.organizer.campus?.name ??
    event.organizer.company?.name ??
    "muLearn";

  const organizerLogo =
    event.organizer.ig?.logo ??
    event.organizer.ig?.logo ??
    event.organizer.campus?.logo ??
    event.organizer.campus?.logo ??
    event.organizer.company?.logo ??
    null;

  const acceptedCollaborators = event.collaborators.filter(
    (collab) => collab.invite_status === "accepted",
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <div
        className="relative w-full overflow-hidden rounded-2xl shadow-sm"
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

      <div
        className={
          layout === "full"
            ? "grid grid-cols-1 gap-8 lg:grid-cols-3"
            : "grid grid-cols-1"
        }
      >
        <div
          className={
            layout === "full" ? "space-y-6 lg:col-span-2" : "space-y-6"
          }
        >
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <h1 className="text-3xl font-bold tracking-tight">
                {event.title}
              </h1>
              {showInterestButton ? (
                <div className="shrink-0">
                  <InterestButton
                    eventId={event.id}
                    status={event.viewer_interest_status}
                    count={event.interest_count}
                  />
                </div>
              ) : null}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
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

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{new Date(event.start_datetime).toLocaleString()}</span>
              <span>to</span>
              <span>{new Date(event.end_datetime).toLocaleString()}</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Badge variant="outline" className="gap-1">
                <CalendarDays className="h-3.5 w-3.5" />{" "}
                {event.scope.replace(/_/g, " ")}
              </Badge>
              <Badge variant="outline" className="capitalize">
                Venue: {event.venue.type}
              </Badge>
              <Badge variant="outline">{event.interest_count} interested</Badge>
            </div>
          </div>

          <section className="prose max-w-none text-sm leading-6 text-gray-700">
            <p className="whitespace-pre-wrap">{event.description}</p>
          </section>

          {event.linked_tasks.length > 0 ? (
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Linked Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.linked_tasks.map((task) => (
                  <div key={task.id} className="rounded-md border p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-medium">{task.title}</p>
                      <Badge variant="secondary">{task.karma} karma</Badge>
                    </div>
                    <p className="font-mono text-xs text-gray-500">
                      #{task.hashtag}
                    </p>
                    {task.ig ? (
                      <p className="text-xs text-gray-500">{task.ig.name}</p>
                    ) : null}
                    {task.bonus_time ? (
                      <p className="text-xs text-green-700">
                        Bonus: +{task.bonus_karma} karma before{" "}
                        {new Date(task.bonus_time).toLocaleString()}
                      </p>
                    ) : null}
                    {!task.active ? (
                      <Badge variant="destructive" className="mt-1">
                        Task closed
                      </Badge>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {Array.isArray(event.tags) && event.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Venue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {(event.venue.type === "physical" ||
                event.venue.type === "hybrid") && (
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {event.venue.address ?? "Address not provided"}
                  {event.venue.city ? `, ${event.venue.city}` : ""}
                </p>
              )}
              {(event.venue.type === "online" ||
                event.venue.type === "hybrid") && (
                <p className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  {event.venue.platform ?? "Online"}
                </p>
              )}
              {event.venue.maps_url ? (
                <Button variant="outline" asChild>
                  <a
                    href={event.venue.maps_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in Maps
                  </a>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {layout === "full" ? (
          <div className="space-y-4 lg:col-span-1 lg:sticky lg:top-6 lg:self-start">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {countdown ? (
                  <p
                    className={
                      countdown.urgent
                        ? "flex items-center gap-1 text-amber-600 font-semibold"
                        : "text-xs text-gray-500"
                    }
                  >
                    {countdown.urgent ? (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    ) : null}
                    {countdown.label}
                  </p>
                ) : null}

                {event.registration_url ? (
                  <Button
                    asChild
                    disabled={!event.viewer_can_access_registration}
                  >
                    <a
                      href={event.registration_url}
                      target="_blank"
                      rel="noreferrer"
                    >
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

                {event.min_karma != null ? (
                  <p className="text-xs text-gray-600">
                    Minimum karma required: {event.min_karma.toLocaleString()}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
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

            {acceptedCollaborators.length > 0 ? (
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle>Accepted collaborators</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {acceptedCollaborators.map((collab) => {
                    const name =
                      collab.ig?.name ??
                      collab.campus?.name ??
                      (collab.ig?.name && collab.campus?.name
                        ? `${collab.ig.name} @ ${collab.campus.name}`
                        : null) ??
                      collab.company?.name ??
                      "Collaborator";
                    return (
                      <Badge
                        key={collab.id}
                        variant="outline"
                        className="capitalize"
                      >
                        {name}
                      </Badge>
                    );
                  })}
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
