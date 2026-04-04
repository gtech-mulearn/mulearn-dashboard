"use client";

import {
  AlertTriangle,
  CalendarDays,
  Clock,
  ExternalLink,
  Info,
  MapPin,
  Monitor,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEventDetail } from "../hooks";
import { InterestButton } from "./interest-button";

interface EventDetailViewProps {
  eventId: string;
  showInterestButton?: boolean;
  layout?: "full" | "content-only";
}

function organizerLabel(type: string): string {
  return type.replace(/_/g, " ");
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDateRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);

  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  const month = start.toLocaleString("en-IN", { month: "short" });

  if (sameMonth) {
    return `${month} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
  }

  return `${start.toLocaleString("en-IN", { month: "short", day: "numeric" })} - ${end.toLocaleString("en-IN", { month: "short", day: "numeric" })}, ${sameYear ? start.getFullYear() : `${start.getFullYear()}-${end.getFullYear()}`}`;
}

function mapEmbedUrl(query: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=13&output=embed`;
}

function countdownLabel(
  deadline: string | null,
  nowTs: number,
): { label: string; urgent: boolean } | null {
  if (!deadline) return null;
  const target = new Date(deadline).getTime();
  const diff = target - nowTs;
  if (diff <= 0) return { label: "Registration closed", urgent: true };

  const totalMinutes = Math.floor(diff / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return {
      label: `Registration closes in ${days}d ${hours}h ${minutes}m`,
      urgent: days < 3,
    };
  }

  return {
    label: `Registration closes in ${hours}h ${minutes}m`,
    urgent: true,
  };
}

export function EventDetailView({
  eventId,
  showInterestButton = true,
  layout = "full",
}: EventDetailViewProps) {
  const { data: event, isLoading, isError, error } = useEventDetail(eventId);
  const [nowTs, setNowTs] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowTs(Date.now());
    }, 1000 * 30);

    return () => window.clearInterval(timer);
  }, []);

  const countdown = event
    ? countdownLabel(event.registration_deadline, nowTs)
    : null;

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

  const mapQuery =
    `${event.venue.address ?? ""} ${event.venue.city ?? ""}`.trim();

  return (
    <TooltipProvider>
      <div className="mx-auto w-full max-w-7xl space-y-6 pb-24 lg:pb-6">
        <div
          className="relative w-full overflow-hidden rounded-2xl shadow-sm"
          style={{ aspectRatio: "16/5" }}
        >
          {event.banner_image || event.cover_image ? (
            <Image
              src={
                event.banner_image ??
                event.cover_image ??
                "/images/fallback.webp"
              }
              alt={event.title}
              fill
              className="object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-900/55 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {event.is_featured ? (
                  <Badge className="bg-amber-200 text-amber-900">
                    <Star className="mr-1 h-3.5 w-3.5" /> Featured
                  </Badge>
                ) : null}
                {Array.isArray(event.tags)
                  ? event.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="capitalize"
                      >
                        {tag}
                      </Badge>
                    ))
                  : null}
              </div>

              <h1 className="max-w-4xl text-2xl font-bold tracking-tight sm:text-3xl">
                {event.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-sm text-white/90">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  {formatDateRange(event.start_datetime, event.end_datetime)}
                </span>
                {event.venue.city ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {event.venue.city}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-2 py-1">
                  {organizerLogo ? (
                    <Image
                      src={organizerLogo}
                      alt={organizerName}
                      width={18}
                      height={18}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <span className="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white/30 text-[10px] font-semibold">
                      {organizerName.charAt(0)}
                    </span>
                  )}
                  {organizerName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {layout === "full" ? (
          <div className="sticky top-3 z-30 rounded-xl border bg-background/95 p-3 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
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
                  <Button disabled>Registration Unavailable</Button>
                )}

                {countdown ? (
                  <p className="inline-flex items-center gap-1 text-xs text-amber-700">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {countdown.label}
                  </p>
                ) : null}

                {event.min_karma != null ? (
                  <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    Minimum karma: {event.min_karma.toLocaleString()}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Earn karma by completing tasks and activities in
                        muLearn.
                      </TooltipContent>
                    </Tooltip>
                  </p>
                ) : null}
              </div>

              {showInterestButton ? (
                <InterestButton
                  eventId={event.id}
                  status={event.viewer_interest_status}
                  count={event.interest_count}
                />
              ) : null}
            </div>
          </div>
        ) : null}

        <Card className="rounded-2xl">
          <CardContent className="grid grid-cols-1 gap-3 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <p className="inline-flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              {formatDateRange(event.start_datetime, event.end_datetime)}
            </p>
            <p className="inline-flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {event.venue.address ?? "Address not provided"}
              {event.venue.city ? `, ${event.venue.city}` : ""}
            </p>
            <p className="inline-flex items-center gap-2 text-muted-foreground capitalize">
              <Users className="h-4 w-4" />
              {event.venue.type} - {event.scope.replace(/_/g, " ")}
            </p>
            <p className="inline-flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {formatTime(event.start_datetime)} onwards
            </p>
          </CardContent>
        </Card>

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
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent className="text-base leading-8 text-gray-700">
                <p className="whitespace-pre-wrap">{event.description}</p>
              </CardContent>
            </Card>

            {acceptedCollaborators.length > 0 ? (
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle>Partnering Organizations</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {acceptedCollaborators.map((collab) => {
                    const entityName =
                      collab.entity_detail &&
                      typeof collab.entity_detail === "object"
                        ? "name" in collab.entity_detail &&
                          typeof collab.entity_detail.name === "string"
                          ? collab.entity_detail.name
                          : "title" in collab.entity_detail &&
                              typeof collab.entity_detail.title === "string"
                            ? collab.entity_detail.title
                            : null
                        : null;

                    const name =
                      entityName ??
                      collab.ig?.name ??
                      collab.campus?.title ??
                      collab.campus?.name ??
                      (collab.ig?.name && collab.campus_ig?.name
                        ? `${collab.ig.name} @ ${collab.campus_ig.name}`
                        : null) ??
                      collab.company?.title ??
                      collab.company?.name ??
                      "Collaborator";

                    return (
                      <Badge
                        key={collab.id}
                        variant="outline"
                        className="px-3 py-1 text-sm"
                      >
                        {name}
                      </Badge>
                    );
                  })}
                </CardContent>
              </Card>
            ) : null}

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

            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Venue & Map</CardTitle>
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

                {mapQuery ? (
                  <div className="overflow-hidden rounded-lg border">
                    <iframe
                      title="Event venue map"
                      src={mapEmbedUrl(mapQuery)}
                      className="h-64 w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                ) : null}

                {event.venue.maps_url ? (
                  <Button variant="ghost" size="sm" asChild className="w-fit">
                    <a
                      href={event.venue.maps_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1"
                    >
                      Open in Maps <ExternalLink className="h-3.5 w-3.5" />
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

              {event.interest_count > 0 ? (
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle>Social Proof</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {event.interest_count} people marked this event as going.
                    </p>
                  </CardContent>
                </Card>
              ) : null}

              {!event.viewer_can_access_registration &&
              event.viewer_access_blocked_reason ? (
                <Card className="rounded-2xl border-red-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-red-700">
                      Registration Blocked
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-red-600">
                      {event.viewer_access_blocked_reason}
                    </p>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          ) : null}
        </div>

        {layout === "full" ? (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur lg:hidden">
            <div className="flex items-center gap-2">
              {event.registration_url ? (
                <Button
                  asChild
                  className="flex-1"
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
                <Button className="flex-1" disabled>
                  Registration Unavailable
                </Button>
              )}
              {showInterestButton ? (
                <InterestButton
                  eventId={event.id}
                  status={event.viewer_interest_status}
                  count={event.interest_count}
                />
              ) : null}
            </div>
            {countdown ? (
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                {countdown.label}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </TooltipProvider>
  );
}
