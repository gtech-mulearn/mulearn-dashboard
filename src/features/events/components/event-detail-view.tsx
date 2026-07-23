"use client";

import { cn } from "@/lib/utils";
import { useEventDetail } from "../hooks";
import type { EventDetailViewProps } from "../types";
import { EventAboutSection } from "./event-about-section";
import { EventCollaboratorsSection } from "./event-collaborators-section";
import { EventDetailSkeleton } from "./event-detail-skeleton";
import { EventHeroBanner } from "./event-hero-banner";
import { EventIdentityBar } from "./event-identity-bar";
import { EventMobileBar } from "./event-mobile-bar";
import { EventOrganizerCard } from "./event-organizer-card";
import { EventRegistrationCard } from "./event-registration-card";
import { EventTasksSection } from "./event-tasks-section";
import { EventVenueSection } from "./event-venue-section";

export function EventDetailView({
  eventId,
  showInterestButton = true,
  layout = "full",
  showVenue = true,
  initialEvent,
}: EventDetailViewProps) {
  const {
    data: fetchedEvent,
    isLoading,
    isError,
    error,
  } = useEventDetail(initialEvent ? undefined : eventId);

  const event = initialEvent ?? fetchedEvent;

  if (isLoading && !initialEvent) {
    return <EventDetailSkeleton />;
  }

  if ((isError || !event) && !initialEvent) {
    return (
      <p className="text-sm text-destructive">
        {process.env.NODE_ENV === "development" && error instanceof Error
          ? error.message
          : "Failed to load event"}
      </p>
    );
  }

  if (!event) return null;

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
    return "µLearn";
  })();

  const organizerLogo =
    event.organizer.ig?.logo ??
    event.organizer.campus?.logo ??
    event.organizer.company?.logo ??
    "/images/mulearn-logo-small.jpg";

  return (
    <div
      className={cn(
        layout === "full" &&
          "w-full max-w-full overflow-x-hidden bg-background rounded-2xl shadow-sm p-4 min-h-[calc(100vh-6rem)]",
      )}
    >
      <div className="mx-auto w-full max-w-7xl space-y-5 pb-24 lg:pb-6 lc-fade-in overflow-x-hidden">
        <EventHeroBanner
          event={event}
          organizerName={organizerName}
          organizerLogo={organizerLogo}
        />

        <EventIdentityBar event={event} />

        <div
          className={cn(
            "grid gap-5 w-full max-w-full overflow-x-hidden",
            layout === "full" && "lg:grid-cols-[minmax(0,1fr)_360px]",
          )}
        >
          {/* Main Column */}
          <div className="min-w-0 w-full max-w-full space-y-5 overflow-x-hidden">
            <EventAboutSection description={event.description} />
            <EventTasksSection tasks={event.linked_tasks} />
            {showVenue && <EventVenueSection venue={event.venue} />}
            <EventCollaboratorsSection collaborators={event.collaborators} />
          </div>

          {/* Sticky Sidebar */}
          {layout === "full" && (
            <aside className="min-w-0 w-full max-w-full space-y-4 overflow-x-hidden lg:sticky lg:top-6 lg:self-start">
              <EventRegistrationCard
                event={event}
                showInterestButton={showInterestButton}
              />
              <EventOrganizerCard
                event={event}
                organizerName={organizerName}
                organizerLogo={organizerLogo}
              />
            </aside>
          )}
        </div>

        {layout === "full" && <EventMobileBar event={event} />}
      </div>
    </div>
  );
}
