"use client";

import { useState } from "react";
import {
  BarChart2,
  Briefcase,
  CheckCircle,
  Eye,
  TrendingUp,
  Users,
  Percent,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGigAnalytics,
  useCompanyDashboardSummary,
  useJobEngagementAnalytics,
  useTalentPoolAnalytics,
  useJobs,
} from "@/features/company-jobs/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function CompanyAnalyticsPage() {
  const [activeTab, setActiveTab] = useState("dashboard-summary");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BarChart2 className="h-8 w-8 text-primary" />
          Analytics & Insights
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitor your job listing engagement, gig performance, and browse
          community talent pool statistics.
        </p>
      </div>
      {/* Tab triggers omitted for brevity but remain identical */}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 bg-muted rounded-xl">
          <TabsTrigger
            value="dashboard-summary"
            className="py-2.5 rounded-lg text-xs md:text-sm font-medium"
          >
            Dashboard Summary
          </TabsTrigger>
          <TabsTrigger
            value="gig-analytics"
            className="py-2.5 rounded-lg text-xs md:text-sm font-medium"
          >
            Gig Performance
          </TabsTrigger>
          <TabsTrigger
            value="job-engagement"
            className="py-2.5 rounded-lg text-xs md:text-sm font-medium"
          >
            Job Engagement
          </TabsTrigger>
          <TabsTrigger
            value="talent-pool-stats"
            className="py-2.5 rounded-lg text-xs md:text-sm font-medium"
          >
            Talent Pool Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="dashboard-summary"
          className="space-y-6 focus-visible:outline-none"
        >
          <DashboardSummaryView />
        </TabsContent>

        <TabsContent
          value="gig-analytics"
          className="space-y-6 focus-visible:outline-none"
        >
          <GigAnalyticsView />
        </TabsContent>

        <TabsContent
          value="job-engagement"
          className="space-y-6 focus-visible:outline-none"
        >
          <JobEngagementView />
        </TabsContent>

        <TabsContent
          value="talent-pool-stats"
          className="space-y-6 focus-visible:outline-none"
        >
          <TalentPoolInsightsView />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── 1. Dashboard Summary View ──────────────────────────────────────────────
function DashboardSummaryView() {
  const [period, setPeriod] = useState<string>("30d");
  const {
    data: summary,
    isLoading,
    refetch,
    isRefetching,
    isError,
    error,
  } = useCompanyDashboardSummary({ period });

  const stats = summary?.quick_stats;
  const cards = summary?.stat_cards ?? [];

  return (
    <div className="space-y-6">
      <Card className="border border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold">
              Dashboard Summary Filters
            </CardTitle>
            <CardDescription>
              Adjust the period to view delta comparison statistics
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading || isRefetching}
              className="h-9 w-9"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 space-y-3">
              <Skeleton className="h-4 w-1/3 rounded" />
              <Skeleton className="h-8 w-1/2 rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="p-12 text-center text-muted-foreground border-destructive/20 bg-destructive/5 dark:bg-destructive/10 dark:border-destructive/20">
          <p className="font-semibold text-destructive">
            Failed to load summary analytics
          </p>
          <p className="text-xs mt-1 text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Internal Server Error. Please contact administrator if this persists."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-4 gap-1.5 mx-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Try Again
          </Button>
        </Card>
      ) : !stats ? (
        <Card className="p-12 text-center text-muted-foreground">
          No summary analytics found. Ensure you are logged in with a verified
          company profile.
        </Card>
      ) : (
        <>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => {
              const isIncrease = card.delta_type === "increase";
              return (
                <Card
                  key={card.key}
                  className="relative overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {card.label}
                    </p>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-3xl font-bold tracking-tight">
                        {card.value}
                      </span>
                      <Badge
                        variant={isIncrease ? "outline" : "destructive"}
                        className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isIncrease
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isIncrease ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {isIncrease ? "+" : "-"}
                        {card.delta}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1">
                      <span>Compared to last {card.period}</span>
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Company details card */}
          {summary.company && (
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Active Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                {summary.company.logo ? (
                  <img
                    src={summary.company.logo}
                    alt={summary.company.name}
                    className="h-16 w-16 rounded-xl object-contain border bg-white p-1"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    {summary.company.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg">{summary.company.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className="capitalize text-xs font-medium"
                    >
                      {summary.company.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ID: {summary.company.id}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// ─── 2. Gig Analytics View ───────────────────────────────────────────────
function GigAnalyticsView() {
  const {
    data: gigs,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useGigAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 space-y-2">
              <Skeleton className="h-4 w-1/3 rounded" />
              <Skeleton className="h-8 w-1/2 rounded" />
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <Skeleton className="h-48 w-full rounded" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-12 text-center text-muted-foreground border-destructive/20 bg-destructive/5 dark:bg-destructive/10 dark:border-destructive/20">
        <p className="font-semibold text-destructive">
          Failed to load Gig Analytics
        </p>
        <p className="text-xs mt-1 text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "Internal Server Error. Please contact administrator if this persists."}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="mt-4 gap-1.5 mx-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Try Again
        </Button>
      </Card>
    );
  }

  if (!gigs) {
    return (
      <Card className="p-12 text-center text-muted-foreground space-y-3">
        <p>No Gig Analytics statistics found for this company.</p>
        <p className="text-xs">
          (Note: This API analyzes jobs posted as "gig" or contract type. Ensure
          you have published gig openings).
        </p>
      </Card>
    );
  }

  const funnel = gigs.application_funnel || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Gig Job metrics
          </h2>
          <p className="text-xs text-muted-foreground">
            Aggregated performance across all published contract and gig roles
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="gap-2 h-9 text-xs"
        >
          <RefreshCw
            className={`h-3 w-3 ${isRefetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Total Gigs Posted
              </p>
              <h3 className="text-2xl font-bold mt-1.5">
                {gigs.total_gigs_posted}
              </h3>
            </div>
            <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <Briefcase className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Active Gigs
              </p>
              <h3 className="text-2xl font-bold mt-1.5 text-emerald-600 dark:text-emerald-400">
                {gigs.active_gigs}
              </h3>
            </div>
            <div className="h-9 w-9 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Closed Gigs
              </p>
              <h3 className="text-2xl font-bold mt-1.5 text-muted-foreground">
                {gigs.closed_gigs}
              </h3>
            </div>
            <div className="h-9 w-9 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
              <Eye className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Average Hourly Rate
              </p>
              <h3 className="text-2xl font-bold mt-1.5 text-indigo-600 dark:text-indigo-400">
                ₹{gigs.average_hourly_rate}
              </h3>
            </div>
            <div className="h-9 w-9 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-600">
              <span className="font-bold text-sm">₹</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel chart list */}
        <Card className="lg:col-span-2 border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Application Funnel Breakdown
            </CardTitle>
            <CardDescription>
              Track candidates moving across your recruitment pipelines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(funnel).map(([stage, count]) => {
              const maxCount = funnel.Total || 1;
              const percentage = Math.round((Number(count) / maxCount) * 100);
              return (
                <div key={stage} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="capitalize">{stage}</span>
                    <span className="text-muted-foreground">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Conversion rate card */}
        <Card className="flex flex-col justify-between border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Overall Conversion
            </CardTitle>
            <CardDescription>
              Rate of applicants selected for hire
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center py-6">
            <div className="relative flex items-center justify-center">
              <div className="h-28 w-28 rounded-full border-4 border-indigo-500/10 flex items-center justify-center">
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  {gigs.conversion_rate}
                </span>
              </div>
              <div className="absolute -bottom-1 bg-indigo-600 text-[10px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-0.5">
                <Percent className="h-2.5 w-2.5" /> Funnel
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-6 max-w-[200px]">
              Calculated dynamically as selected candidates divided by total
              applications received.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── 3. Job Engagement View ───────────────────────────────────────────────
function JobEngagementView() {
  const { data: jobsResponse, isLoading: jobsLoading } = useJobs({
    perPage: 100,
  });
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const {
    data: analytics,
    isLoading: analyticsLoading,
    isError,
    error,
    refetch,
  } = useJobEngagementAnalytics(selectedJobId);

  const jobsList = jobsResponse?.jobs ?? [];

  return (
    <div className="space-y-6">
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Job Performance Analytics
          </CardTitle>
          <CardDescription>
            Select a job listing to view granular view engagement analytics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1.5">
              <Label
                htmlFor="job-select"
                className="text-xs font-semibold text-muted-foreground uppercase"
              >
                Select Job Listing
              </Label>
              {jobsLoading ? (
                <Skeleton className="h-10 w-full rounded-md" />
              ) : (
                <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                  <SelectTrigger id="job-select">
                    <SelectValue placeholder="Select a job..." />
                  </SelectTrigger>
                  <SelectContent>
                    {jobsList.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title} ({job.location})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedJobId ? (
        analyticsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-5 space-y-2">
                <Skeleton className="h-4 w-1/3 rounded" />
                <Skeleton className="h-8 w-1/2 rounded" />
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card className="p-12 text-center text-muted-foreground border-destructive/20 bg-destructive/5 dark:bg-destructive/10 dark:border-destructive/20">
            <p className="font-semibold text-destructive">
              Failed to load job engagement analytics
            </p>
            <p className="text-xs mt-1 text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Internal Server Error. Please contact administrator if this persists."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-4 gap-1.5 mx-auto"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Try Again
            </Button>
          </Card>
        ) : !analytics ? (
          <Card className="p-8 text-center text-muted-foreground">
            No analytics returned for the selected job listing.
          </Card>
        ) : (
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Analytics for "{analytics.job_title}"
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Total Views
                    </p>
                    <h4 className="text-2xl font-bold mt-1.5">
                      {analytics.total_views}
                    </h4>
                  </div>
                  <div className="h-8 w-8 bg-sky-500/10 text-sky-600 rounded flex items-center justify-center">
                    <Eye className="h-4.5 w-4.5" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Applications Received
                    </p>
                    <h4 className="text-2xl font-bold mt-1.5">
                      {analytics.total_applications}
                    </h4>
                  </div>
                  <div className="h-8 w-8 bg-amber-500/10 text-amber-600 rounded flex items-center justify-center">
                    <Briefcase className="h-4.5 w-4.5" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Hired Candidates
                    </p>
                    <h4 className="text-2xl font-bold mt-1.5 text-emerald-600 dark:text-emerald-400">
                      {analytics.total_hired}
                    </h4>
                  </div>
                  <div className="h-8 w-8 bg-emerald-500/10 text-emerald-600 rounded flex items-center justify-center">
                    <CheckCircle className="h-4.5 w-4.5" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Conversion Rate
                    </p>
                    <h4 className="text-2xl font-bold mt-1.5 text-violet-600 dark:text-violet-400">
                      {analytics.conversion_rate_percentage}%
                    </h4>
                  </div>
                  <div className="h-8 w-8 bg-violet-500/10 text-violet-600 rounded flex items-center justify-center">
                    <Percent className="h-4.5 w-4.5" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      ) : (
        <div className="border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
          Select a job listing above to render the view conversion metrics.
        </div>
      )}
    </div>
  );
}

// ─── 4. Talent Pool Insights View ──────────────────────────────────────────
function TalentPoolInsightsView() {
  const [karmaMin, setKarmaMin] = useState<number | undefined>(undefined);
  const [karmaMax, setKarmaMax] = useState<number | undefined>(undefined);
  const [levelMin, setLevelMin] = useState<number | undefined>(undefined);
  const [workFT, setWorkFT] = useState<boolean>(false);
  const [workGig, setWorkGig] = useState<boolean>(false);
  const [igIds, setIgIds] = useState<string>("");

  const {
    data: analytics,
    isLoading,
    refetch,
    isRefetching,
    isError,
    error,
  } = useTalentPoolAnalytics({
    karma_min: karmaMin,
    karma_max: karmaMax,
    level_order_min: levelMin,
    interested_in_work: workFT || undefined,
    interested_in_gig_work: workGig || undefined,
    ig_ids: igIds || undefined,
  });

  return (
    <div className="space-y-6">
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Talent Pool Filters
          </CardTitle>
          <CardDescription>
            Apply demographic and availability filters to compute pool
            statistics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase">
                Min Karma
              </Label>
              <Input
                type="number"
                placeholder="e.g. 500"
                value={karmaMin ?? ""}
                onChange={(e) =>
                  setKarmaMin(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase">
                Max Karma
              </Label>
              <Input
                type="number"
                placeholder="e.g. 5000"
                value={karmaMax ?? ""}
                onChange={(e) =>
                  setKarmaMax(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase">
                Min Level Order
              </Label>
              <Input
                type="number"
                placeholder="e.g. 2"
                value={levelMin ?? ""}
                onChange={(e) =>
                  setLevelMin(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase">
                Interest Group IDs
              </Label>
              <Input
                placeholder="Comma separated UUIDs"
                value={igIds}
                onChange={(e) => setIgIds(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t">
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ft-work"
                  checked={workFT}
                  onCheckedChange={(c) => setWorkFT(!!c)}
                />
                <Label
                  htmlFor="ft-work"
                  className="text-xs font-semibold cursor-pointer"
                >
                  Interested in Full-Time Work
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gig-work"
                  checked={workGig}
                  onCheckedChange={(c) => setWorkGig(!!c)}
                />
                <Label
                  htmlFor="gig-work"
                  className="text-xs font-semibold cursor-pointer"
                >
                  Interested in Gig Work
                </Label>
              </div>
            </div>

            <Button
              onClick={() => refetch()}
              disabled={isLoading || isRefetching}
              size="sm"
              className="h-9 px-4 gap-2"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`}
              />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="p-6">
          <Skeleton className="h-48 w-full rounded" />
        </Card>
      ) : isError ? (
        <Card className="p-12 text-center text-muted-foreground border-destructive/20 bg-destructive/5 dark:bg-destructive/10 dark:border-destructive/20">
          <p className="font-semibold text-destructive">
            Failed to load talent pool insights
          </p>
          <p className="text-xs mt-1 text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Internal Server Error. Please contact administrator if this persists."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-4 gap-1.5 mx-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Try Again
          </Button>
        </Card>
      ) : !analytics ? (
        <Card className="p-12 text-center text-muted-foreground">
          No talent pool insights found.
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm max-w-max">
            <Users className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">
              {analytics.total_learners.toLocaleString()}
            </span>
            <span className="text-muted-foreground">
              total learners match the criteria
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Level Distribution */}
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Level Distribution
                </CardTitle>
                <CardDescription>
                  Ecosystem candidate levels mapping
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.level_distribution.map((ld) => (
                  <div key={ld.level_id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{ld.level_name}</span>
                      <span className="text-muted-foreground">
                        {ld.count} candidates ({ld.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${ld.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Interest Groups */}
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Top Interest Groups
                </CardTitle>
                <CardDescription>
                  Most active learning skill areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        <th className="p-2.5 font-bold uppercase text-muted-foreground">
                          Skill Focus
                        </th>
                        <th className="p-2.5 font-bold uppercase text-muted-foreground text-right">
                          Learner Count
                        </th>
                        <th className="p-2.5 font-bold uppercase text-muted-foreground text-right">
                          Total Karma
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {analytics.top_interest_groups.map((ig) => (
                        <tr key={ig.ig_id} className="hover:bg-muted/30">
                          <td className="p-2.5 font-medium text-foreground">
                            {ig.name}
                          </td>
                          <td className="p-2.5 text-right font-medium">
                            {ig.learner_count}
                          </td>
                          <td className="p-2.5 text-right font-medium text-emerald-600 dark:text-emerald-400">
                            {ig.total_karma.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
