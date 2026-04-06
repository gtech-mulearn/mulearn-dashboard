"use client";

import { ExternalLink, MapPin, Users } from "lucide-react";

interface EventAnalyticsPanelProps {
  interestCount: number;
  venueName: string | null;
  mapsUrl: string | null;
  mapQuery: string;
}

function buildMapUrl(mapQuery: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=13&output=embed`;
}

export function EventAnalyticsPanel({
  interestCount,
  venueName,
  mapsUrl,
  mapQuery,
}: EventAnalyticsPanelProps) {
  return (
    <div>
      <section className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 lc-card-shadow">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--primary)_12%,var(--background))] text-primary">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            People Going
          </p>
          <p className="mt-1 text-3xl font-bold text-foreground">
            {interestCount}
          </p>
        </div>
      </section>

      {mapQuery ? (
        <section className="mt-4 overflow-hidden rounded-2xl border border-border bg-card lc-card-shadow">
          <iframe
            title="Event location map"
            src={buildMapUrl(mapQuery)}
            className="h-48 w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="space-y-2 p-3">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {venueName ?? "Venue not set"}
            </p>
            {mapsUrl ? (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Open in Maps
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
