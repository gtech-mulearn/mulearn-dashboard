"use client";

import { ExternalLink, MapPin, Users } from "lucide-react";
import { buildGoogleMapEmbedUrl } from "../hooks";
import type { EventAnalyticsPanelProps } from "../types";

export function EventAnalyticsPanel({
  interestCount,
  venueName,
  mapsUrl,
  mapQuery,
}: EventAnalyticsPanelProps) {
  return (
    <div className="space-y-4">
      <section className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 lc-card-shadow lc-fade-in">
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
        <section className="rounded-2xl border border-border bg-card p-3 lc-card-shadow">
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
              <MapPin className="h-3.5 w-3.5" />
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
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
