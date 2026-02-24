"use client";

import { use } from "react";
import Loader from "@/app/loading";
import { Card } from "@/components/ui/card";
import { ClicksChart } from "@/features/url-shortner";
import { BrowserBreakdown } from "@/features/url-shortner/components/browser-breakdown";
import { CityBreakdown } from "@/features/url-shortner/components/city-breakdown";
import { CountryBreakdown } from "@/features/url-shortner/components/country-breakdown";
import { DeviceBreakdown } from "@/features/url-shortner/components/device-breakdown";
import { IpBreakdown } from "@/features/url-shortner/components/ip-breakdown";
import { PlatformBreakdown } from "@/features/url-shortner/components/platform-breakdown";
import { RegionBreakdown } from "@/features/url-shortner/components/region-breakdown";
import { SourceBreakdown } from "@/features/url-shortner/components/source-breakdown";
import { TimelineChart } from "@/features/url-shortner/components/timeline-chart";
import { useShortUrlAnalytics } from "@/features/url-shortner/hooks/use-short-urls";

interface AnalyticsViewProps {
  params: Promise<{
    id: string;
  }>;
}

export const AnalyticsView = ({ params }: AnalyticsViewProps) => {
  const { id } = use(params);
  const { data: analytics, isLoading, isError } = useShortUrlAnalytics(id);

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Invalid URL ID</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Failed to load analytics.</p>
      </div>
    );
  }

  const {
    short_url,
    long_url,
    title,
    total_clicks = 0,
    countries = {},
    browsers = {},
    platforms = {},
    devices = {},
    sources = {},
    region = {},
    city = {},
    ip_address = {},
    time_based_data = { all_time: [] },
    created_on,
  } = analytics;

  return (
    <div className="min-h-screen">
      <div className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {title || short_url}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3 bg-secondary p-4 rounded-lg border border-border/50">
            <span className="font-semibold bg-primary text-primary-foreground px-3 py-1 rounded text-sm flex-shrink-0">
              Short
            </span>
            <div className="flex-1 bg-card p-3 rounded border border-border flex items-center justify-between group overflow-x-auto">
              <code className="text-sm font-mono whitespace-nowrap">
                {short_url ? `https://mulearn.org/r/${short_url}` : "—"}
              </code>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3 bg-secondary p-4 rounded-lg border border-border/50">
            <span className="font-semibold bg-primary text-primary-foreground px-3 py-1 rounded text-sm flex-shrink-0">
              Long
            </span>
            <div className="flex-1 bg-card p-3 rounded border border-border flex items-center justify-between group overflow-x-auto">
              <code className="text-sm font-mono whitespace-nowrap">
                {long_url ?? "—"}
              </code>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Clicks</p>
            <p className="text-3xl font-bold">{total_clicks}</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Countries</p>
            <p className="text-3xl font-bold">
              {Object.keys(countries).length}
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Regions</p>
            <p className="text-3xl font-bold">{Object.keys(region).length}</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Created On</p>
            <p className="text-sm font-semibold">
              {created_on ? new Date(created_on).toLocaleDateString() : "—"}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">Click Timeline</h2>
            <TimelineChart
              data={time_based_data.all_time.map(([time, clicks]) => ({
                time,
                clicks,
              }))}
            />
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">Click Distribution</h2>
            <ClicksChart total={total_clicks} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">Browsers</h2>
            <BrowserBreakdown data={browsers} />
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">Platforms</h2>
            <PlatformBreakdown data={platforms} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">Devices</h2>
            <DeviceBreakdown data={devices} />
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">Sources</h2>
            <SourceBreakdown data={sources} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">Countries</h2>
            <CountryBreakdown data={countries} />
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">Regions</h2>
            <RegionBreakdown data={region} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">Cities</h2>
            <CityBreakdown data={city} />
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">IP Addresses</h2>
            <IpBreakdown data={ip_address} />
          </Card>
        </div>
      </div>
    </div>
  );
};
