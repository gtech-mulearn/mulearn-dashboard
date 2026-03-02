/**
 * Event Detail View
 *
 * 📍 src/features/events/components/event-detail-view.tsx
 *
 * Full detail page for a single event. Fetches data via useEvent hook.
 * Shows hero, body, linked tasks, collaborators, and interest button.
 */

"use client";

import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Globe,
  MapPin,
  Monitor,
  Shield,
  Tag,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvent } from "../hooks/events.hooks";
import type { EventDetail } from "../schemas/events.schema";
import { EventStatusBadge } from "./event-status-badge";
import { EventTypeBadge } from "./event-type-badge";
import { InterestButton } from "./interest-button";

interface EventDetailViewProps {
  eventId: string;
}

export function EventDetailView({ eventId }: EventDetailViewProps) {
  const router = useRouter();
  const { data, isLoading, error } = useEvent(eventId);

  if (isLoading) return <EventDetailSkeleton />;
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">
          Failed to load event. It may have been removed.
        </p>
        <Button variant="ghost" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go back
        </Button>
      </div>
    );
  }

  const event: EventDetail = data;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/events">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
        </Link>
      </Button>

      {/* Hero section */}
      <div
        className="relative w-full rounded-xl overflow-hidden"
        style={{ aspectRatio: "21/9" }}
      >
        <Image
          src={
            event.banner_image ?? event.cover_image ?? "/images/fallback.webp"
          }
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div className="space-y-2">
            <div className="flex gap-2 flex-wrap">
              <EventTypeBadge eventType={event.event_type} />
              <EventStatusBadge status={event.status} />
              {event.is_featured && (
                <Badge className="bg-yellow-400/90 text-yellow-900">
                  Featured
                </Badge>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {event.title}
            </h1>
          </div>
          <InterestButton
            eventId={event.id}
            interestStatus={event.viewer_interest_status}
            interestCount={event.interest_count}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {event.description}
              </p>
            </CardContent>
          </Card>

          {/* Tags */}
          {event.tags.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Linked Tasks */}
          {event.linked_tasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Linked Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.linked_tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        #{task.hashtag}
                      </p>
                    </div>
                    <Badge variant="outline">{task.karma} karma</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Collaborators */}
          {event.collaborators.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Collaborators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {event.collaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          collab.ig?.logo ??
                          collab.campus?.logo ??
                          collab.company?.logo ??
                          undefined
                        }
                      />
                      <AvatarFallback>
                        {(
                          collab.ig?.name ??
                          collab.campus?.name ??
                          collab.company?.name ??
                          "C"
                        ).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {collab.ig?.name ??
                          collab.campus?.name ??
                          collab.campus_ig?.ig.name ??
                          collab.company?.name}
                      </p>
                      {collab.role_label && (
                        <p className="text-xs text-muted-foreground">
                          {collab.role_label}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {collab.invite_status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Date & Time */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(event.start_datetime)}
                    {" — "}
                    {formatDate(event.end_datetime)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Time</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(event.start_datetime)}
                    {" — "}
                    {formatTime(event.end_datetime)}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Venue */}
              <div className="flex items-start gap-3">
                {event.venue.type === "online" ? (
                  <Monitor className="h-5 w-5 text-muted-foreground mt-0.5" />
                ) : (
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-medium capitalize">
                    {event.venue.type}
                  </p>
                  {event.venue.address && (
                    <p className="text-sm text-muted-foreground">
                      {event.venue.address}
                      {event.venue.city && `, ${event.venue.city}`}
                    </p>
                  )}
                  {event.venue.platform && (
                    <p className="text-sm text-muted-foreground">
                      {event.venue.platform}
                    </p>
                  )}
                </div>
              </div>

              {event.venue.maps_url && (
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a
                    href={event.venue.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="mr-2 h-4 w-4" /> View on Maps
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Registration */}
          {event.registration_url && (
            <Card>
              <CardContent className="pt-6">
                <Button className="w-full" asChild>
                  <a
                    href={event.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" /> Register
                  </a>
                </Button>
                {!event.viewer_can_access_registration &&
                  event.viewer_access_blocked_reason && (
                    <p className="text-xs text-destructive mt-2">
                      {event.viewer_access_blocked_reason}
                    </p>
                  )}
                {event.registration_deadline && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Deadline: {formatDate(event.registration_deadline)}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Karma requirement */}
          {event.min_karma != null && event.min_karma > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">
                    Minimum <strong>{event.min_karma}</strong> karma required
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Organizer */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Organized by</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={
                      event.organizer.ig?.logo ??
                      event.organizer.campus?.logo ??
                      event.organizer.company?.logo ??
                      undefined
                    }
                  />
                  <AvatarFallback>
                    <Globe className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {event.organizer.ig?.name ??
                      event.organizer.campus?.name ??
                      event.organizer.company?.name ??
                      event.organizer.campus_ig?.ig.name ??
                      "μLearn"}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {event.organizer.type.replace("_", " ")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interest */}
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-semibold">
                  {event.interest_count}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                people interested
              </p>
              <InterestButton
                eventId={event.id}
                interestStatus={event.viewer_interest_status}
                interestCount={event.interest_count}
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  try {
    return format(new Date(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

function formatTime(iso: string): string {
  try {
    return format(new Date(iso), "h:mm a");
  } catch {
    return iso;
  }
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function EventDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="w-full rounded-xl" style={{ aspectRatio: "21/9" }} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
