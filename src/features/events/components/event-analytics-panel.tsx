"use client";

import { ExternalLink, MapPin, Star, Users } from "lucide-react";
import { buildGoogleMapEmbedUrl } from "../hooks";
import type { EventAnalyticsPanelProps } from "../types";
import { ExpandableMapDialog } from "./expandable-map-dialog";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  );
}

export function EventAnalyticsPanel({
  interestCount,
  venueName,
  mapsUrl,
  mapQuery,
  analytics,
}: EventAnalyticsPanelProps) {
  const satisfaction = analytics?.learner_satisfaction;
  return (
    <div className="space-y-4">
      <section className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm lc-fade-in">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
          <Users className="size-5" />
        </div>
        <div className="flex min-w-0 flex-col justify-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            People Going
          </p>
          <p className="text-3xl font-bold leading-tight tabular-nums text-foreground">
            {interestCount}
          </p>
        </div>
      </section>

      {analytics && (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Engagement
          </h3>
          <dl className="grid grid-cols-2 gap-4">
            <Stat label="RSVPs" value={analytics.total_rsvps ?? 0} />
            <Stat label="Attended" value={analytics.total_attendance ?? 0} />
            <Stat
              label="Attendance rate"
              value={analytics.attendance_rate ?? "—"}
            />
            <Stat
              label="Repeat attendees"
              value={analytics.repeat_attendees ?? 0}
            />
          </dl>
          <p className="mt-4 flex items-center gap-1.5 border-t pt-3 text-sm">
            <Star
              className="size-4 fill-amber-400 text-amber-400"
              aria-hidden="true"
            />
            <span className="text-muted-foreground">Satisfaction</span>
            <span className="ml-auto font-medium text-foreground">
              {satisfaction?.average_rating != null &&
              satisfaction.rating_count > 0
                ? `${satisfaction.average_rating.toFixed(1)} (${satisfaction.rating_count})`
                : "No ratings yet"}
            </span>
          </p>
        </section>
      )}

      {mapQuery ? (
        <section className="rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="overflow-hidden rounded-xl">
            <iframe
              title="Event location map"
              src={buildGoogleMapEmbedUrl(mapQuery)}
              className="h-48 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="space-y-2 pt-3">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              {venueName ?? "Venue not set"}
            </p>
            {mapsUrl ? (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Open in Maps
                <ExternalLink className="size-3" />
              </a>
            ) : null}
            <ExpandableMapDialog
              mapQuery={mapQuery}
              mapsUrl={mapsUrl}
              venueName={venueName}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}
