"use client";

import dynamic from "next/dynamic";
import { use, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Copy,
  ExternalLink,
  Globe,
  MapPin,
  MousePointerClick,
  RefreshCw,
  Link2,
  Activity,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CityBreakdown,
  IpBreakdown,
  RegionBreakdown,
  SourceBreakdown,
  useShortUrlAnalytics,
} from "@/features/url-shortener";

/* ─── Dynamic chart imports ───────────────────────────────────────────── */
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

/* ─── Types ───────────────────────────────────────────────────────────── */
interface AnalyticsViewProps {
  params: Promise<{ id: string }>;
}

/* ─── Copy Button ─────────────────────────────────────────────────────── */
function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Button
      type="button"
      variant="secondary"
      size="icon-sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setOk(true);
          toast.success("URL copied to clipboard!");
          setTimeout(() => setOk(false), 1800);
        } catch {
          toast.error("Failed to copy URL to clipboard.");
        }
      }}
      aria-label="Copy"
      className="h-7 w-7 shrink-0"
    >
      {ok ? (
        <Check className="size-3.5 text-success" />
      ) : (
        <Copy className="size-3.5" />
      )}
    </Button>
  );
}

/* ─── Inline Tab Switcher ─────────────────────────────────────────────── */
function TabBar<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (v: T) => void;
}) {
  const activeTabLabel = tabs.find((t) => t.id === active)?.label || "";

  return (
    <>
      {/* Mobile Select dropdown */}
      <div className="block lg:hidden w-full max-w-[200px]">
        <Select value={active} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue>{activeTabLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent position="popper">
            {tabs.map(({ id, label }) => (
              <SelectItem key={id} value={id}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Buttons */}
      <div className="hidden lg:flex gap-1 rounded-full p-1">
        {tabs.map(({ id, label }) => (
          <Button
            key={id}
            variant={active === id ? "default" : "outline"}
            type="button"
            onClick={() => onChange(id)}
            className="text-xs font-semibold"
          >
            {label}
          </Button>
        ))}
      </div>
    </>
  );
}

/* ─── Breakdown Panel (tabbed card) ──────────────────────────────────── */
function BreakdownPanel<T extends string>({
  tabs,
  panels,
}: {
  tabs: { id: T; label: string }[];
  panels: Record<T, React.ReactNode>;
}) {
  const [active, setActive] = useState<T>(tabs[0].id);
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-center lg:justify-between gap-2 border-b border-border px-5 py-4">
        <TabBar tabs={tabs} active={active} onChange={setActive} />
      </div>
      <div className="flex-1 p-5">{panels[active]}</div>
    </div>
  );
}

/* ─── Stat Pill (inside hero) ────────────────────────────────────────── */
function StatPill({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card px-5 py-4 w-full transition-shadow duration-150 hover:shadow-sm">
      <div className="text-muted-foreground">{icon}</div>
      <span className="text-2xl font-bold leading-none tracking-tight text-foreground">
        {value}
      </span>
      <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

/* ─── Empty / Error State ────────────────────────────────────────────── */
function EmptyState({
  icon,
  title,
  desc,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="max-w-sm space-y-2">
        <p className="text-lg font-bold text-foreground">{title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
      </div>
      {action}
    </div>
  );
}

/* ─── Loading Skeleton ───────────────────────────────────────────────── */
function LoadingView() {
  return (
    <div className="min-h-screen">
      {/* hero skeleton */}
      <div className="h-56 w-full bg-muted animate-pulse" />
      <div className="max-w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        <Skeleton className="h-52 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────────────── */
export const AnalyticsView = ({ params }: AnalyticsViewProps) => {
  const { id } = use(params);
  const {
    data: analytics,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useShortUrlAnalytics(id);

  const handleRefresh = async () => {
    try {
      const result = await refetch();
      if (result.isError) {
        toast.error("Failed to refresh analytics.");
      } else {
        toast.success("Analytics refreshed successfully!");
      }
    } catch {
      toast.error("Failed to refresh analytics.");
    }
  };

  if (!id)
    return (
      <EmptyState
        icon={<Link2 className="size-7" />}
        title="Invalid URL ID"
        desc="The URL ID is missing or invalid. Go back and try again."
        action={<Button onClick={handleRefresh}>Retry</Button>}
      />
    );

  if (isLoading) return <LoadingView />;

  if (isError)
    return (
      <EmptyState
        icon={
          <RefreshCw className={`size-7 ${isFetching ? "animate-spin" : ""}`} />
        }
        title="Failed to Load"
        desc="We couldn't fetch analytics data. Check your connection and try again."
        action={
          <Button onClick={handleRefresh} disabled={isFetching}>
            <RefreshCw
              className={`size-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`}
            />
            Try Again
          </Button>
        }
      />
    );

  if (!analytics)
    return (
      <EmptyState
        icon={<MousePointerClick className="size-7" />}
        title="No Analytics Yet"
        desc="Share your short link to start tracking clicks and engagement."
        action={
          <Button onClick={handleRefresh} disabled={isFetching}>
            <RefreshCw
              className={`size-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        }
      />
    );

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

  const shortFull = short_url ? `https://mulearn.org/r/${short_url}` : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-full mx-auto px-4 sm:px-6 pt-5 pb-6">
          {/* Top row: back + refresh */}
          <div className="flex items-center justify-between mb-5">
            <Link href="/dashboard/url-shortener" aria-label="Back">
              <Button
                type="button"
                variant="link"
                className="flex items-center gap-1.5"
              >
                <ArrowLeft className="size-3.5" />
                <span className="hidden sm:inline">URL Shortener</span>
              </Button>
            </Link>

            <Button
              type="button"
              onClick={handleRefresh}
              className="flex items-center gap-1.5"
              disabled={isFetching}
            >
              <RefreshCw
                className={`size-3.5 ${isFetching ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>

          {/* Title + badge */}
          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-snug">
              {title || "Link Analytics"}
            </h1>

            {/* URL strip */}
            {shortFull && (
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex flex-1 min-w-0 items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5">
                  <Link2 className="size-3 shrink-0 text-muted-foreground" />
                  <span className="truncate font-mono text-[11px] text-foreground">
                    {shortFull}
                  </span>
                  <CopyBtn text={shortFull} />
                  <a
                    href={shortFull}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open short URL in new tab"
                    className="cursor-pointer text-muted-foreground transition-colors duration-150 hover:text-foreground"
                  >
                    <ExternalLink className="size-3" />
                  </a>
                </div>
                {long_url && (
                  <div className="flex flex-1 min-w-0 items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5">
                    <Globe className="size-3 shrink-0 text-muted-foreground" />
                    <span className="truncate font-mono text-[11px] text-muted-foreground">
                      {long_url}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* KPI pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <StatPill
              label="Total Clicks"
              value={total_clicks.toLocaleString()}
              icon={<MousePointerClick className="size-4" />}
            />
            <StatPill
              label="Countries"
              value={Object.keys(countries).length}
              icon={<Globe className="size-4" />}
            />
            <StatPill
              label="Regions"
              value={Object.keys(region).length}
              icon={<MapPin className="size-4" />}
            />
            <StatPill
              label="Cities"
              value={Object.keys(city).length}
              icon={<LayoutGrid className="size-4" />}
            />
            <StatPill
              label="Created"
              value={
                created_on
                  ? new Date(created_on).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"
              }
              icon={<CalendarDays className="size-4" />}
            />
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
        {total_clicks === 0 && (
          <div
            className="flex items-center gap-3 rounded-xl border border-warning/25
                          bg-warning/[0.06] px-4 py-3.5"
          >
            <MousePointerClick className="size-4 shrink-0 text-warning" />
            <p className="text-sm text-foreground/80">
              No clicks recorded yet — share your link to start seeing data.
            </p>
          </div>
        )}

        {/* ── Full-width Timeline chart ─────────────────────────── */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-purple">
                <Activity className="size-3.5" />
              </span>
              <span className="font-semibold text-sm text-foreground">
                Click Timeline
              </span>
            </div>
            <span className="rounded-full bg-brand-purple/10 px-2.5 py-0.5 text-[11px] font-bold text-brand-purple">
              {total_clicks.toLocaleString()} clicks
            </span>
          </div>
          <div className="p-5">
            <TimelineChart
              data={time_based_data.all_time.map(([time, clicks]) => ({
                time,
                clicks,
              }))}
            />
          </div>
        </div>

        {/* ── Three column tabbed breakdowns ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Panel 1 — Geo */}
          <BreakdownPanel
            tabs={[
              { id: "countries" as const, label: "Countries" },
              { id: "regions" as const, label: "Regions" },
              { id: "cities" as const, label: "Cities" },
            ]}
            panels={{
              countries: <CountryBreakdown data={countries} />,
              regions: <RegionBreakdown data={region} />,
              cities: <CityBreakdown data={city} />,
            }}
          />

          {/* Panel 2 — Tech */}
          <BreakdownPanel
            tabs={[
              { id: "browsers" as const, label: "Browsers" },
              { id: "devices" as const, label: "Devices" },
              { id: "platforms" as const, label: "Platforms" },
            ]}
            panels={{
              browsers: <BrowserBreakdown data={browsers} />,
              devices: <DeviceBreakdown data={devices} />,
              platforms: <PlatformBreakdown data={platforms} />,
            }}
          />

          {/* Panel 3 — Traffic */}
          <BreakdownPanel
            tabs={[
              { id: "sources" as const, label: "Sources" },
              { id: "ips" as const, label: "IP Address" },
              { id: "dist" as const, label: "Distribution" },
            ]}
            panels={{
              sources: <SourceBreakdown data={sources} />,
              ips: <IpBreakdown data={ip_address} />,
              dist: <ClicksChart total={total_clicks} />,
            }}
          />
        </div>
      </div>
    </div>
  );
};
