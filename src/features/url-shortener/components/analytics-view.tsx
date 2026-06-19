"use client";

import dynamic from "next/dynamic";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CityBreakdown,
  IpBreakdown,
  RegionBreakdown,
  SourceBreakdown,
  useShortUrlAnalytics,
} from "@/features/url-shortener";

const BrowserBreakdown = dynamic(
  () =>
    import("./browser-breakdown").then((m) => ({
      default: m.BrowserBreakdown,
    })),
  { ssr: false },
);
const ClicksChart = dynamic(
  () => import("./clicks-chart").then((m) => ({ default: m.ClicksChart })),
  { ssr: false },
);
const CountryBreakdown = dynamic(
  () =>
    import("./country-breakdown").then((m) => ({
      default: m.CountryBreakdown,
    })),
  { ssr: false },
);
const DeviceBreakdown = dynamic(
  () =>
    import("./device-breakdown").then((m) => ({ default: m.DeviceBreakdown })),
  { ssr: false },
);
const PlatformBreakdown = dynamic(
  () =>
    import("./platform-breakdown").then((m) => ({
      default: m.PlatformBreakdown,
    })),
  { ssr: false },
);
const TimelineChart = dynamic(
  () => import("./timeline-chart").then((m) => ({ default: m.TimelineChart })),
  { ssr: false },
);

interface AnalyticsViewProps {
  params: Promise<{
    id: string;
  }>;
}

export const AnalyticsView = ({ params }: AnalyticsViewProps) => {
  const { id } = use(params);
  const {
    data: analytics,
    isLoading,
    isError,
    refetch,
  } = useShortUrlAnalytics(id);

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-destructive text-lg font-semibold">
            Invalid URL ID
          </div>
          <p className="text-muted-foreground text-sm">
            The URL ID provided is invalid or does not exist. Please check the
            URL and try again.
          </p>
          <Button variant={"default"} onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons don't have stable IDs
              <Card key={i} className="p-6 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons don't have stable IDs
              <Card key={i} className="p-6 space-y-6">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-64 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-destructive text-2xl font-semibold">
            Failed to load analytics
          </div>
          <p className="text-muted-foreground text-lg">
            We couldn&apos;t fetch analytics data. Please try again later.
          </p>
          <Button variant={"default"} onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-3 max-w-md">
          <p className="text-2xl font-semibold text-foreground">
            No Analytics Yet
          </p>
          <p className="text-muted-foreground text-lg">
            This short URL hasn&apos;t received any clicks yet. Share the link
            to start tracking engagement.
          </p>
          <Button variant={"default"} onClick={() => refetch()}>
            Retry
          </Button>
        </div>
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
            <span className="font-semibold bg-brand-blue/10 text-brand-blue px-3 py-1 rounded text-sm flex-shrink-0">
              Short
            </span>
            <div className="flex-1 bg-card p-3 rounded border border-border flex items-center justify-between group overflow-x-auto">
              <code className="text-sm font-mono whitespace-nowrap">
                {short_url ? `https://mulearn.org/r/${short_url}` : "—"}
              </code>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3 bg-secondary p-4 rounded-lg border border-border/50">
            <span className="font-semibold bg-brand-purple/10 text-brand-purple px-3 py-1 rounded text-sm flex-shrink-0">
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
