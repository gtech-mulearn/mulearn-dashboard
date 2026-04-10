"use client";

import {
  CalendarDays,
  Clock,
  ExternalLink,
  Info,
  MapPin,
  Monitor,
  Star,
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
import {
  formatEventDateRange,
  formatEventTime,
  organizerTypeLabel,
  useEventDetail,
} from "../hooks";
import type { EventDetailViewProps } from "../types";
import { EventAnalyticsPanel } from "./event-analytics-panel";
import { InterestButton } from "./interest-button";

export function EventDetailView({
  eventId,
  showInterestButton = true,
  layout = "full",
  showVenue = true,
}: EventDetailViewProps) {
  const { data: event, isLoading, isError, error } = useEventDetail(eventId);
  const [nowTs, setNowTs] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowTs(Date.now());
    }, 1000 * 30);

    return () => window.clearInterval(timer);
  }, []);

  const registrationClosed =
    !!event?.registration_deadline &&
    new Date(event.registration_deadline).getTime() <= nowTs;

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

  const organizerName = (() => {
    const { type, ig, campus, company, campus_ig } = event.organizer;
    if (type === "global_ig") return ig?.name ?? "Global IG";
    if (type === "campus_ig") {
      const igName = ig?.name;
      const campusName = campus?.title ?? campus?.name;
      if (igName && campusName) return `${igName} @ ${campusName}`;
      return campus_ig?.name ?? "Campus IG";
    }
    if (type === "campus") return campus?.title ?? campus?.name ?? "Campus";
    if (type === "company") return company?.title ?? company?.name ?? "Company";
    return "MuLearn";
  })();

  const organizerLogo =
    event.organizer.ig?.logo ??
    event.organizer.campus?.logo ??
    event.organizer.company?.logo ??
    null;

  const mapQuery = [event.venue.address, event.venue.city]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(", ");

  const acceptedCollaborators = event.collaborators.filter(
    (collab) => collab.invite_status === "accepted",
  );

  return (
    <TooltipProvider>
      <div className="mx-auto w-full max-w-7xl space-y-6 pb-24 lg:pb-6 lc-fade-in">
        <div
          className={
            layout === "full"
              ? "grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]"
              : "grid grid-cols-1"
          }
        >
          <div className="space-y-6">
            <div className="space-y-6">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl md:aspect-[21/9]">
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
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/50 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {event.is_featured ? (
                        <Badge className="ig-status-requested border-0">
                          <Star className="mr-1 h-3.5 w-3.5" /> Featured
                        </Badge>
                      ) : null}
                      {Array.isArray(event.tags)
                        ? event.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              className="border border-primary-foreground/20 bg-primary-foreground/20 capitalize text-primary-foreground backdrop-blur-sm"
                            >
                              {tag}
                            </Badge>
                          ))
                        : null}
                    </div>

                    <h1 className="max-w-4xl text-2xl font-bold tracking-tight text-primary-foreground md:text-3xl">
                      {event.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/90">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {formatEventDateRange(
                          event.start_datetime,
                          event.end_datetime,
                        )}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatEventTime(event.start_datetime)} onwards
                      </span>
                      <span className="inline-flex items-center gap-1 capitalize">
                        <Monitor className="h-4 w-4" />
                        {event.venue.type} · {event.scope.replace(/_/g, " ")}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.venue.address
                          ? `${event.venue.address}${event.venue.city ? `, ${event.venue.city}` : ""}`
                          : (event.venue.city ?? "Address not provided")}
                      </span>
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

              <Card className="rounded-2xl border border-border bg-card lc-card-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg leading-none">
                    About This Event
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-base leading-relaxed text-muted-foreground">
                  <p className="whitespace-pre-wrap">{event.description}</p>
                </CardContent>
              </Card>

              {acceptedCollaborators.length > 0 ? (
                <Card className="rounded-2xl border border-border bg-card lc-card-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg leading-none">
                      Partnering Organizations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-1.5 pt-0 sm:grid-cols-2">
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
                        <span
                          key={collab.id}
                          className="inline-flex w-full items-center rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground"
                        >
                          {name}
                        </span>
                      );
                    })}
                  </CardContent>
                </Card>
              ) : null}

              {event.linked_tasks.length > 0 ? (
                <Card className="rounded-2xl border border-border bg-card lc-card-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">Linked Tasks</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {event.linked_tasks.map((task) => (
                      <div key={task.id} className="rounded-md border p-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="font-medium">{task.title}</p>
                          <Badge variant="secondary">{task.karma} karma</Badge>
                        </div>
                        <p className="font-mono text-xs text-muted-foreground">
                          #{task.hashtag}
                        </p>
                        {task.ig ? (
                          <p className="text-xs text-muted-foreground">
                            {task.ig.name}
                          </p>
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

              {showVenue ? (
                <Card className="rounded-2xl border border-border bg-card lc-card-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">Venue</CardTitle>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="w-fit"
                      >
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
              ) : null}
            </div>
          </div>

          {layout === "full" ? (
            <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              <Card className="rounded-2xl border border-border bg-card lc-card-shadow">
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.registration_url ? (
                    registrationClosed ? (
                      <Button
                        disabled
                        className="w-full bg-muted text-muted-foreground hover:bg-muted"
                      >
                        Registration Closed
                      </Button>
                    ) : (
                      <Button
                        asChild
                        disabled={!event.viewer_can_access_registration}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
                      >
                        <a
                          href={event.registration_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Register Now
                        </a>
                      </Button>
                    )
                  ) : (
                    <Button disabled className="w-full">
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

                  {event.min_karma != null ? (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
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
                </CardContent>
              </Card>

              <EventAnalyticsPanel
                interestCount={event.interest_count}
                venueName={
                  event.venue.address ?? event.venue.city ?? "Venue not set"
                }
                mapsUrl={event.venue.maps_url}
                mapQuery={mapQuery}
              />

              <Card className="rounded-2xl border border-border bg-card lc-card-shadow">
                <CardHeader>
                  <CardTitle className="text-base">Organizer</CardTitle>
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
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-semibold text-foreground">
                        {organizerName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-foreground">
                        {organizerName}
                      </p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {organizerTypeLabel(event.organizer.type)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {event.interest_count > 0 ? (
                <Card className="rounded-2xl border border-border bg-card lc-card-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">Social Proof</CardTitle>
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
                <Card className="rounded-2xl border-destructive/30 bg-[color-mix(in_srgb,var(--destructive)_8%,var(--background))]">
                  <CardHeader>
                    <CardTitle className="text-destructive">
                      Registration Blocked
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-destructive/80">
                      {event.viewer_access_blocked_reason}
                    </p>
                  </CardContent>
                </Card>
              ) : null}
            </aside>
          ) : null}
        </div>

        {layout === "full" ? (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur lg:hidden">
            <div className="flex items-center gap-2">
              {event.registration_url ? (
                registrationClosed ? (
                  <Button
                    className="flex-1 bg-muted text-muted-foreground hover:bg-muted"
                    disabled
                  >
                    Registration Closed
                  </Button>
                ) : (
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
                )
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
          </div>
        ) : null}
      </div>
    </TooltipProvider>
  );
}
