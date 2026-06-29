"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EventDetail } from "../types";

interface EventReviewPanelProps {
  event: EventDetail;
}

export function EventReviewPanel({ event }: EventReviewPanelProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
    if (type === "admin") {
      return "Admin";
    }
    return "MuLearn";
  };

  const reviewRows = [
    { label: "Title", value: event.title },
    { label: "Description", value: event.description || "Not set" },
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
    { label: "Start", value: formatDate(event.start_datetime) },
    { label: "End", value: formatDate(event.end_datetime) },
    {
      label: "Venue",
      value:
        event.venue.type === "online"
          ? "Online"
          : event.venue.address || event.venue.city || "Venue TBA",
    },
    { label: "Online Link", value: event.venue.online_link || "Not set" },
    { label: "Platform", value: event.venue.platform || "Not set" },
    {
      label: "Tags",
      value: event.tags ? JSON.stringify(event.tags) : "Not set",
    },
    { label: "Collaboration", value: event.is_collaboration ? "Yes" : "No" },
    { label: "Featured", value: event.is_featured ? "Yes" : "No" },
    { label: "Min Karma", value: event.min_karma?.toString() || "0" },
    { label: "User Limit", value: event.user_limit?.toString() || "Unlimited" },
    { label: "Registration URL", value: event.registration_url || "Not set" },
    {
      label: "Registration Deadline",
      value: event.registration_deadline
        ? formatDate(event.registration_deadline)
        : "Not set",
    },
  ];

  return (
    <Card className="rounded-2xl border-border bg-card lc-card-shadow">
      <CardHeader>
        <CardTitle className="text-lg">Review Your Event</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {reviewRows.map((row) => (
            <div
              key={row.label}
              className="border-b border-border px-0 py-3 last:border-b-0"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-muted-foreground">
                  {row.label}
                </span>
                <span className="text-right text-sm font-semibold text-foreground break-words max-w-xs">
                  {row.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
