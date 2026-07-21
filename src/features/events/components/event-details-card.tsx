"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EventDetail } from "../types";

interface EventDetailsCardProps {
  event: EventDetail;
}

/**
 * Admin-facing metadata that has no other home in the manage view: the main
 * column (EventDetailView, layout="content-only") only renders description,
 * tasks, and collaborators — organiser, registration, and capacity fields
 * are shown here instead of duplicating what's already on the hero banner,
 * identity bar, and sidebar map.
 */
export function EventDetailsCard({ event }: EventDetailsCardProps) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(undefined, {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getOrganizerName = () => {
    const type = event.organizer.type ?? event.organizer.organiser_type;

    if (type === "global_ig") {
      return (
        event.organizer.ig?.name ??
        event.organizer.organiser_ig?.name ??
        "Global IG"
      );
    }
    if (type === "campus_ig") {
      const igName =
        event.organizer.ig?.name ?? event.organizer.organiser_ig?.name;
      const campusInfo =
        event.organizer.campus ?? event.organizer.organiser_campus;
      const campusName = campusInfo?.title ?? campusInfo?.name;
      return igName && campusName ? `${igName} @ ${campusName}` : "Campus IG";
    }
    if (type === "campus") {
      const campusInfo =
        event.organizer.campus ?? event.organizer.organiser_campus;
      return campusInfo?.title ?? campusInfo?.name ?? "Campus";
    }
    if (type === "company") {
      const companyInfo =
        event.organizer.company ?? event.organizer.organiser_company;
      return companyInfo?.title ?? companyInfo?.name ?? "Company";
    }
    return "µLearn";
  };

  const details = [
    { label: "Organizer", value: getOrganizerName() },
    {
      label: "Scope",
      value:
        event.scope_ig?.name ||
        event.scope_org?.title ||
        event.scope ||
        "Not set",
    },
    { label: "Category", value: event.category_name || "Not set" },
    { label: "Online Link", value: event.venue.online_link || "Not set" },
    { label: "Platform", value: event.venue.platform || "Not set" },
    { label: "Min Karma", value: event.min_karma?.toString() || "0" },
    {
      label: "User Limit",
      value: event.user_limit ? event.user_limit.toString() : "Unlimited",
    },
    { label: "Registration URL", value: event.registration_url || "Not set" },
    {
      label: "Registration Deadline",
      value: event.registration_deadline
        ? formatDate(event.registration_deadline)
        : "Not set",
    },
    { label: "Collaboration", value: event.is_collaboration ? "Yes" : "No" },
    { label: "Featured", value: event.is_featured ? "Yes" : "No" },
  ];

  return (
    <Card className="rounded-2xl border-border bg-card lc-card-shadow">
      <CardHeader>
        <CardTitle className="text-lg">Event Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {details.map((detail) => (
            <div key={detail.label} className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">
                {detail.label}
              </p>
              <p className="text-sm font-semibold text-foreground wrap-break-word">
                {detail.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
