"use client";

import {
  Activity,
  Briefcase,
  CheckCircle,
  Eye,
  GraduationCap,
  IndianRupee,
  Layers,
  Percent,
  RefreshCw,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { StateDisplay } from "@/components/ui/state-display";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCampusAnalytics,
  useCampusQuarterTrend,
  useCompanyDashboardSummary,
  useGigAnalytics,
  useJobEngagementAnalytics,
  useJobs,
  useTalentPoolAnalytics,
  useTasksAnalytics,
} from "@/features/company-jobs/hooks";
import {
  extractInterestGroups,
  useInterestGroupsList,
} from "@/features/interest-groups";
import { useCollegeSearch } from "@/features/onboarding";

const STAT_GRID = "grid gap-4 sm:grid-cols-2 lg:grid-cols-4";

function StatGridSkeleton() {
  return (
    <div className={STAT_GRID}>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-28 rounded-2xl" />
      ))}
    </div>
  );
}

function AnalyticsError({
  title,
  error,
  onRetry,
}: {
  title: string;
  error: unknown;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-10 text-center">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">
          {process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "Please try again. Contact an administrator if this persists."}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw />
        Try again
      </Button>
    </div>
  );
}

function AnalyticsEmpty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <StateDisplay
      variant="no-results"
      size="sm"
      className="rounded-2xl border border-dashed"
      title={title}
      description={description}
    />
  );
}

function SectionHeader({
  title,
  description,
  onRefresh,
  isRefreshing,
}: {
  title: string;
  description: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw className={isRefreshing ? "animate-spin" : undefined} />
        Refresh
      </Button>
    </div>
  );
}

function MeterBar({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full rounded-full transition-all duration-500 ${className ?? "bg-primary"}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export function CompanyAnalyticsPageClient() {
  const [activeTab, setActiveTab] = useState("dashboard-summary");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Insights"
        description="Monitor your job listing engagement, gig performance, campus outreach, task outcomes, and community talent pool statistics."
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="scrollbar-none overflow-x-auto">
          <TabsList>
            <TabsTrigger value="dashboard-summary">
              Dashboard Summary
            </TabsTrigger>
            <TabsTrigger value="gig-analytics">Gig Performance</TabsTrigger>
            <TabsTrigger value="job-engagement">Job Engagement</TabsTrigger>
            <TabsTrigger value="tasks-analytics">Task Analytics</TabsTrigger>
            <TabsTrigger value="campus-analytics">Campus Insights</TabsTrigger>
            <TabsTrigger value="talent-pool-stats">
              Talent Pool Insights
            </TabsTrigger>
          </TabsList>
        </div>

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
          value="tasks-analytics"
          className="space-y-6 focus-visible:outline-none"
        >
          <TasksAnalyticsView />
        </TabsContent>

        <TabsContent
          value="campus-analytics"
          className="space-y-6 focus-visible:outline-none"
        >
          <CampusAnalyticsView />
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Dashboard Summary Filters</CardTitle>
            <CardDescription>
              Adjust the period to view delta comparison statistics
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-36">
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
              aria-label="Refresh summary"
            >
              <RefreshCw
                className={isRefetching ? "animate-spin" : undefined}
              />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {isLoading ? (
        <StatGridSkeleton />
      ) : isError ? (
        <AnalyticsError
          title="Failed to load summary analytics"
          error={error}
          onRetry={() => refetch()}
        />
      ) : !stats ? (
        <AnalyticsEmpty
          title="No summary analytics yet"
          description="Ensure you are logged in with a verified company profile."
        />
      ) : (
        <>
          {/* Quick Stats Grid */}
          <div className={STAT_GRID}>
            {cards.map((card) => (
              <StatCard
                key={card.key}
                title={card.label}
                value={card.value}
                trend={{
                  value: `${card.delta_type === "increase" ? "+" : "-"}${card.delta}`,
                  direction: card.delta_type === "increase" ? "up" : "down",
                }}
                description={`vs last ${card.period}`}
              />
            ))}
          </div>

          {/* Company details card */}
          {summary.company && (
            <Card>
              <CardHeader>
                <CardTitle>Active Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                {summary.company.logo ? (
                  <Image
                    src={summary.company.logo}
                    alt={summary.company.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-xl object-contain border bg-white p-1"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    {summary.company.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">
                    {summary.company.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="capitalize">
                      {summary.company.status}
                    </Badge>
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
        <StatGridSkeleton />
        <Card className="p-6">
          <Skeleton className="h-48 w-full rounded" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <AnalyticsError
        title="Failed to load Gig Analytics"
        error={error}
        onRetry={() => refetch()}
      />
    );
  }

  if (!gigs) {
    return (
      <AnalyticsEmpty
        title="No gig analytics yet"
        description="Gig analytics cover jobs posted as gig or contract roles. Publish a gig opening to see results here."
      />
    );
  }

  const funnel = gigs.application_funnel || {};

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Gig Job metrics"
        description="Aggregated performance across all published contract and gig roles"
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      <div className={STAT_GRID}>
        <StatCard
          title="Total Gigs Posted"
          value={gigs.total_gigs_posted}
          icon={<Briefcase className="size-5" />}
          accent="chart-1"
        />
        <StatCard
          title="Active Gigs"
          value={gigs.active_gigs}
          icon={<CheckCircle className="size-5" />}
          accent="chart-2"
        />
        <StatCard
          title="Closed Gigs"
          value={gigs.closed_gigs}
          icon={<Eye className="size-5" />}
          accent="chart-3"
        />
        <StatCard
          title="Average Hourly Rate"
          value={`₹${gigs.average_hourly_rate}`}
          icon={<IndianRupee className="size-5" />}
          accent="chart-4"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel chart list */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Application Funnel Breakdown</CardTitle>
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
                  <MeterBar percent={percentage} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Conversion rate card */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Overall Conversion</CardTitle>
            <CardDescription>
              Rate of applicants selected for hire
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center">
            <p className="font-display text-4xl font-bold tracking-tight text-foreground">
              {gigs.conversion_rate}
            </p>
            <p className="max-w-[220px] text-xs text-muted-foreground">
              Selected candidates divided by total applications received.
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
      <Card>
        <CardHeader>
          <CardTitle>Job Performance Analytics</CardTitle>
          <CardDescription>
            Select a job listing to view granular view engagement analytics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="job-select">Select Job Listing</Label>
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
          <StatGridSkeleton />
        ) : isError ? (
          <AnalyticsError
            title="Failed to load job engagement analytics"
            error={error}
            onRetry={() => refetch()}
          />
        ) : !analytics ? (
          <AnalyticsEmpty
            title="No analytics for this listing"
            description="This job listing hasn't collected any engagement data yet."
          />
        ) : (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">
              Analytics for "{analytics.job_title}"
            </h3>

            <div className={STAT_GRID}>
              <StatCard
                title="Total Views"
                value={analytics.total_views}
                icon={<Eye className="size-5" />}
                accent="chart-1"
              />
              <StatCard
                title="Applications Received"
                value={analytics.total_applications}
                icon={<Briefcase className="size-5" />}
                accent="chart-2"
              />
              <StatCard
                title="Hired Candidates"
                value={analytics.total_hired}
                icon={<CheckCircle className="size-5" />}
                accent="chart-3"
              />
              <StatCard
                title="Conversion Rate"
                value={`${analytics.conversion_rate_percentage}%`}
                icon={<Percent className="size-5" />}
                accent="chart-4"
              />
            </div>
          </div>
        )
      ) : (
        <AnalyticsEmpty
          title="Select a job listing"
          description="Pick a job above to see its views, applications, hires and conversion rate."
        />
      )}
    </div>
  );
}

// ─── 4. Tasks Analytics View ─────────────────────────────────────────────────
function TasksAnalyticsView() {
  const {
    data: tasks,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useTasksAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <StatGridSkeleton />
        <Card className="p-6">
          <Skeleton className="h-48 w-full rounded" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <AnalyticsError
        title="Failed to load Tasks Analytics"
        error={error}
        onRetry={() => refetch()}
      />
    );
  }

  if (!tasks) {
    return (
      <AnalyticsEmpty
        title="No task analytics yet"
        description="Submit a company task to start collecting completion and approval data."
      />
    );
  }

  const funnel = tasks.approval_funnel ?? {};
  const funnelOrder = [
    "Total",
    "approved",
    "pending",
    "rejected",
    "changes_requested",
  ];
  const orderedFunnel = [
    ...funnelOrder
      .filter((k) => k in funnel)
      .map((k) => [k, funnel[k]] as [string, number]),
    ...Object.entries(funnel).filter(([k]) => !funnelOrder.includes(k)),
  ];

  const satisfaction = tasks.learner_satisfaction;
  const ratingPct = satisfaction ? (satisfaction.average_rating / 5) * 100 : 0;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Task Analytics"
        description="Aggregated metrics across all company-submitted learning tasks"
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      <div className={STAT_GRID}>
        <StatCard
          title="Tasks Submitted"
          value={tasks.total_tasks_submitted}
          icon={<Layers className="size-5" />}
          accent="chart-1"
        />
        <StatCard
          title="Total Completions"
          value={tasks.total_completions.toLocaleString()}
          icon={<CheckCircle className="size-5" />}
          accent="chart-2"
        />
        <StatCard
          title="Karma Distributed"
          value={tasks.karma_distributed.toLocaleString()}
          icon={<Zap className="size-5" />}
          accent="chart-3"
        />
        <StatCard
          title="Completion Rate"
          value={tasks.completion_rate}
          icon={<Activity className="size-5" />}
          accent="chart-4"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Approval Funnel</CardTitle>
            <CardDescription>
              Task approval status breakdown by admin review
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderedFunnel.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No approval data available.
              </p>
            ) : (
              orderedFunnel.map(([stage, count]) => {
                const total = (funnel.Total as number) || 1;
                const pct = Math.round((Number(count) / total) * 100);
                const colorMap: Record<string, string> = {
                  approved: "bg-success",
                  pending: "bg-warning",
                  rejected: "bg-destructive",
                  changes_requested: "bg-brand-purple",
                  Total: "bg-primary",
                };
                const barColor = colorMap[stage] ?? "bg-primary";
                return (
                  <div key={stage} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="capitalize">
                        {stage.replace(/_/g, " ")}
                      </span>
                      <span className="text-muted-foreground">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <MeterBar percent={pct} className={barColor} />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Learner Satisfaction</CardTitle>
            <CardDescription>
              Average rating from task participants
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-center gap-4 py-6">
            <p className="text-center font-display text-4xl font-bold tracking-tight text-foreground">
              {satisfaction
                ? Number(satisfaction.average_rating).toFixed(1)
                : "—"}
              <span className="text-base font-medium text-muted-foreground">
                {" "}
                / 5
              </span>
            </p>
            <div className="space-y-1">
              <MeterBar percent={ratingPct} className="bg-warning" />
              {satisfaction && (
                <p className="text-center text-xs text-muted-foreground">
                  Based on {satisfaction.rating_count} rating
                  {satisfaction.rating_count !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── 5. Campus Analytics View ────────────────────────────────────────────────
function CampusAnalyticsView() {
  const [activeSub, setActiveSub] = useState<"overview" | "trend">("overview");

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          variant={activeSub === "overview" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveSub("overview")}
        >
          <GraduationCap />
          Campus Overview
        </Button>
        <Button
          variant={activeSub === "trend" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveSub("trend")}
        >
          <TrendingUp />
          Quarterly Trend
        </Button>
      </div>

      {activeSub === "overview" ? <CampusOverview /> : <CampusTrendView />}
    </div>
  );
}

function CampusOverview() {
  const { data, isLoading, error, refetch, isRefetching } =
    useCampusAnalytics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <AnalyticsError
        title="Failed to load Campus Analytics"
        error={error}
        onRetry={() => refetch()}
      />
    );
  }

  if (!data) {
    return (
      <AnalyticsEmpty
        title="No campus analytics available"
        description="Campus analytics are only available to College type organisations."
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Campus Engagement Overview"
        description="Top-10 campuses driving jobs, tasks, and event engagement"
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CampusRankCard
          title="Job Applicants by Campus"
          rows={data.job_applicants_by_campus.map((r) => ({
            name: r.campus_name,
            value: r.applicant_count,
            label: "applicants",
          }))}
        />

        <CampusRankCard
          title="Task Completers by Campus"
          rows={data.task_completers_by_campus.map((r) => ({
            name: r.campus_name,
            value: r.completer_count,
            label: "completers",
          }))}
        />

        <CampusRankCard
          title="Event Attendees by Campus"
          rows={data.event_attendees_by_campus.map((r) => ({
            name: r.campus_name,
            value: r.attendee_count,
            label: "attendees",
          }))}
        />
      </div>
    </div>
  );
}

function CampusRankCard({
  title,
  rows,
}: {
  title: string;
  rows: { name: string; value: number; label: string }[];
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No data available
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => {
              const pct = (row.value / max) * 100;
              return (
                <div key={`${row.name}-${row.value}`} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-foreground truncate max-w-[60%]">
                      {row.name || "Unknown Campus"}
                    </span>
                    <span className="font-semibold text-foreground">
                      {row.value.toLocaleString()}
                    </span>
                  </div>
                  <MeterBar percent={pct} />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CampusTrendView() {
  const [campus, setCampus] = useState<{ id: string; label: string } | null>(
    null,
  );
  const [campusSearch, setCampusSearch] = useState("");
  const [quarters, setQuarters] = useState<number>(4);
  const { data: colleges = [], isFetching: isSearchingColleges } =
    useCollegeSearch(campusSearch);

  const {
    data: trend,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useCampusQuarterTrend(
    campus ? { campus_id: campus.id, quarters } : undefined,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campus Quarterly Trend</CardTitle>
          <CardDescription>
            Choose a campus and number of quarters to view engagement trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full flex-1 space-y-1.5">
              <Label>Campus</Label>
              <Combobox
                options={colleges}
                value={campus?.id}
                selectedLabel={campus?.label}
                onValueChange={(id) =>
                  setCampus({
                    id,
                    label:
                      colleges.find((c) => c.id === id)?.title ??
                      campus?.label ??
                      "",
                  })
                }
                onSearchChange={setCampusSearch}
                loading={isSearchingColleges}
                placeholder="Search for a campus…"
                searchPlaceholder="Type a college name"
                emptyText="No campuses found."
              />
            </div>
            <div className="w-full space-y-1.5 sm:w-36">
              <Label>Quarters</Label>
              <Select
                value={String(quarters)}
                onValueChange={(v) => setQuarters(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 4, 6, 8].map((q) => (
                    <SelectItem key={q} value={String(q)}>
                      {q} Quarters
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {!campus ? (
        <AnalyticsEmpty
          title="Choose a campus"
          description="Search for a campus above to view its quarterly engagement trend."
        />
      ) : isLoading ? (
        <Card className="p-6">
          <Skeleton className="h-48 w-full rounded" />
        </Card>
      ) : error ? (
        <AnalyticsError
          title="Failed to load campus trend data"
          error={error}
          onRetry={() => refetch()}
        />
      ) : !trend ? (
        <AnalyticsEmpty
          title="No trend data returned"
          description="This campus has no engagement data for the selected quarters yet."
        />
      ) : (
        <div className="space-y-6">
          <SectionHeader
            title={trend.campus_name || trend.campus_id}
            description={`Quarterly engagement trend — last ${trend.trend.length} quarter${trend.trend.length !== 1 ? "s" : ""}`}
            onRefresh={() => refetch()}
            isRefreshing={isRefetching}
          />

          {trend.trend.length === 0 ? (
            <AnalyticsEmpty
              title="No quarterly data"
              description="This campus has no engagement recorded for the selected quarters."
            />
          ) : (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quarter</TableHead>
                      <TableHead className="text-right">
                        Active Learners
                      </TableHead>
                      <TableHead className="text-right">
                        Job Applicants
                      </TableHead>
                      <TableHead className="text-right">Karma Earned</TableHead>
                      <TableHead className="text-right">
                        Sessions Held
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trend.trend.map((item) => (
                      <TableRow key={item.quarter}>
                        <TableCell className="font-medium">
                          {item.quarter}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.active_learners.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.job_applicants.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.karma_earned.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.sessions_held.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ─── 6. Talent Pool Insights View ──────────────────────────────────────────
function TalentPoolInsightsView() {
  const [karmaMin, setKarmaMin] = useState<number | undefined>(undefined);
  const [karmaMax, setKarmaMax] = useState<number | undefined>(undefined);
  const [levelMin, setLevelMin] = useState<number | undefined>(undefined);
  const [workFT, setWorkFT] = useState<boolean>(false);
  const [workGig, setWorkGig] = useState<boolean>(false);
  const [igIds, setIgIds] = useState<string[]>([]);
  const { data: igData, isLoading: isLoadingIgs } = useInterestGroupsList();
  const igOptions = (igData ? extractInterestGroups(igData) : []).map((ig) => ({
    value: ig.id,
    label: ig.name,
  }));

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
    ig_ids: igIds.length > 0 ? igIds.join(",") : undefined,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Talent Pool Filters</CardTitle>
          <CardDescription>
            Apply demographic and availability filters to compute pool
            statistics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label>Min Karma</Label>
              <Input
                type="number"
                placeholder="e.g. 500"
                value={karmaMin ?? ""}
                onChange={(e) =>
                  setKarmaMin(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Max Karma</Label>
              <Input
                type="number"
                placeholder="e.g. 5000"
                value={karmaMax ?? ""}
                onChange={(e) =>
                  setKarmaMax(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Min Level Order</Label>
              <Input
                type="number"
                placeholder="e.g. 2"
                value={levelMin ?? ""}
                onChange={(e) =>
                  setLevelMin(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Interest Groups</Label>
              <MultiSelect
                options={igOptions}
                value={igIds}
                onChange={setIgIds}
                disabled={isLoadingIgs}
                placeholder={
                  isLoadingIgs
                    ? "Loading interest groups…"
                    : "All interest groups"
                }
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
                <Label htmlFor="ft-work">Interested in Full-Time Work</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gig-work"
                  checked={workGig}
                  onCheckedChange={(c) => setWorkGig(!!c)}
                />
                <Label htmlFor="gig-work">Interested in Gig Work</Label>
              </div>
            </div>

            <Button
              onClick={() => refetch()}
              disabled={isLoading || isRefetching}
              size="sm"
            >
              <RefreshCw
                className={isRefetching ? "animate-spin" : undefined}
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
        <AnalyticsError
          title="Failed to load talent pool insights"
          error={error}
          onRetry={() => refetch()}
        />
      ) : !analytics ? (
        <AnalyticsEmpty
          title="No talent pool insights"
          description="No learners match these filters. Try widening the karma or level range."
        />
      ) : (
        <div className="space-y-6">
          <div className={STAT_GRID}>
            <StatCard
              title="Matching Learners"
              value={analytics.total_learners.toLocaleString()}
              description="Learners that match the filters"
              icon={<Users className="size-5" />}
              accent="chart-1"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Level Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Level Distribution</CardTitle>
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
                    <MeterBar percent={ld.percentage} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Interest Groups */}
            <Card>
              <CardHeader>
                <CardTitle>Top Interest Groups</CardTitle>
                <CardDescription>
                  Most active learning skill areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Skill Focus</TableHead>
                        <TableHead className="text-right">
                          Learner Count
                        </TableHead>
                        <TableHead className="text-right">
                          Total Karma
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.top_interest_groups.map((ig) => (
                        <TableRow key={ig.ig_id}>
                          <TableCell className="font-medium">
                            {ig.name}
                          </TableCell>
                          <TableCell className="text-right">
                            {ig.learner_count}
                          </TableCell>
                          <TableCell className="text-right">
                            {ig.total_karma.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
