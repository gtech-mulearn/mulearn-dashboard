"use client";

import {
  BookOpen,
  CalendarDays,
  Instagram,
  Linkedin,
  Loader2,
  Plus,
  Trash2,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Pagination from "@/components/dashboard/table/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAddExecomMember,
  useCampusEvents,
  useCampusLeaderboard,
  useCampusOverview,
  useEventDistribution,
  useExecomMembers,
  useIgChapters,
  useKarmaByCluster,
  useRemoveExecomMember,
  useSocialLinks,
} from "../hooks";
import type { CampusEventFilters, CampusLeaderboardFilters } from "../types";

const PIE_COLORS = ["#16a34a", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6"];
const PAGE_SIZE = 10;

// ─── Reusable sub-components ────────────────────────────────────────────────

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function StatCard({
  title,
  value,
  icon,
  featured = false,
  accent,
  accentText,
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
  featured?: boolean;
  accent?: string;
  accentText?: string;
}) {
  if (featured) {
    return (
      <Card
        className="h-full border-border/60 relative overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-default"
        style={{
          background: accent
            ? `linear-gradient(135deg, ${accent}15 0%, ${accent}04 100%)`
            : undefined,
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            background: accent
              ? `radial-gradient(circle at top right, ${accent}, transparent 65%)`
              : undefined,
          }}
        />
        <CardContent className="relative flex h-full flex-col justify-between p-5">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {title}
            </span>
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{
                background: accent ? `${accent}18` : undefined,
                color: accent,
              }}
            >
              {icon}
            </span>
          </div>
          <p
            className="text-4xl font-bold tracking-tight"
            style={{ color: accentText ?? accent }}
          >
            {value}
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="h-full border-border/60 transition-all duration-200 hover:scale-[1.02] hover:shadow-md cursor-default">
      <CardContent className="flex h-full flex-col justify-between p-4">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[10px] font-semibold uppercase tracking-widest">
            {title}
          </span>
          <span className="opacity-50">{icon}</span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export function CampusManageDashboard() {
  // ── Leaderboard state ──
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [leaderboardFilters, setLeaderboardFilters] =
    useState<CampusLeaderboardFilters>({
      page: 1,
      search: "",
      ig: "",
      cluster: "",
      alumni: "all",
    });

  // ── Event filters state ──
  const [eventFilters, setEventFilters] = useState<CampusEventFilters>({
    page: 1,
    status: "",
    type: "",
    date: "",
  });

  // ── Execom admin state ──
  const [newMuid, setNewMuid] = useState("");

  // ─── Queries ────────────────────────────────────────────────────────────
  const { data: overview, isLoading: isOverviewLoading } = useCampusOverview();
  const orgId = overview?.orgId;

  const { data: leaderboardData, isLoading: isLeaderboardLoading } =
    useCampusLeaderboard({ ...leaderboardFilters, orgId });

  const { data: clusterData = [], isLoading: isClusterLoading } =
    useKarmaByCluster(orgId);

  const { data: distribution = [], isLoading: isDistributionLoading } =
    useEventDistribution();

  const { data: eventsData, isLoading: isEventsLoading } =
    useCampusEvents(eventFilters);

  const { data: execom = [], isLoading: isExecomLoading } = useExecomMembers();

  const { data: chapters = [], isLoading: isChaptersLoading } =
    useIgChapters(orgId);

  const { data: socialLinks, isLoading: isSocialLoading } =
    useSocialLinks(orgId);

  // ─── Mutations ───────────────────────────────────────────────────────────
  const { mutate: addExecom, isPending: isAdding } = useAddExecomMember();
  const { mutate: removeExecom, isPending: isRemoving } =
    useRemoveExecomMember();

  // ─── Derived leaderboard data ────────────────────────────────────────────
  const leaderboard = leaderboardData?.items ?? [];
  const leaderboardPagination = leaderboardData?.pagination;
  const events = eventsData?.items ?? [];

  const filteredLeaderboard = useMemo(() => {
    const query = leaderboardFilters.search.trim().toLowerCase();
    return leaderboard.filter((item) => {
      if (query && !item.name.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [leaderboard, leaderboardFilters.search]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      (leaderboardPagination?.count ?? filteredLeaderboard.length) / PAGE_SIZE,
    ),
  );

  const igOptions = useMemo(
    () =>
      Array.from(new Set(leaderboard.map((item) => item.ig)))
        .filter(Boolean)
        .map((ig) => ({ label: ig, value: ig })),
    [leaderboard],
  );

  const clusterOptions = useMemo(
    () =>
      Array.from(new Set(leaderboard.map((item) => item.cluster)))
        .filter(Boolean)
        .map((cluster) => ({ label: cluster, value: cluster })),
    [leaderboard],
  );

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleLeaderboardFilterChange =
    (key: keyof CampusLeaderboardFilters) => (value: string) => {
      setLeaderboardPage(1);
      setLeaderboardFilters((prev) => ({ ...prev, page: 1, [key]: value }));
    };

  const handleEventFilterChange =
    (key: keyof CampusEventFilters) => (value: string) => {
      setEventFilters((prev) => ({ ...prev, page: 1, [key]: value }));
    };

  const handleAddExecom = () => {
    const muid = newMuid.trim();
    if (!muid) return;
    addExecom(muid, { onSuccess: () => setNewMuid("") });
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Campus Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-10">
          {/* ── 1. Overview Stat Cards + Karma Trend ── */}
          <section>
            <SectionTitle
              title="1. Dashboard Overview"
              subtitle="Campus details, karma, rank and member statistics"
            />
            {isOverviewLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-36 w-full rounded-2xl" />
                <div className="grid gap-4 md:grid-cols-4">
                  {[...Array(7)].map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
                    <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                  ))}
                </div>
                <Skeleton className="h-64 w-full rounded-2xl" />
              </div>
            ) : (
              <>
                {/* ── Glassmorphism Hero Header ── */}
                <div className="relative mb-6 overflow-hidden rounded-2xl border border-border/40">
                  {/* gradient backdrop */}
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-sky-500/10 to-violet-500/20" />
                  <div className="absolute inset-0 backdrop-blur-[2px]" />
                  {/* subtle grid pattern */}
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(0deg,transparent,transparent 24px,currentColor 24px,currentColor 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,currentColor 24px,currentColor 25px)",
                    }}
                  />
                  <div className="relative flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                    {/* Left: avatar + college info */}
                    <div className="flex items-center gap-4">
                      {/* Initials avatar */}
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-sky-600 text-lg font-bold text-white shadow-lg">
                        {(overview?.campusCode ?? overview?.collegeName ?? "C")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold leading-snug tracking-tight text-foreground">
                          {overview?.collegeName ?? "-"}
                        </h3>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          <span className="inline-flex items-center rounded-lg bg-background/60 px-2.5 py-0.5 text-xs font-medium ring-1 ring-border/60">
                            {overview?.campusCode ?? "-"}
                          </span>
                          <span className="inline-flex items-center rounded-lg bg-background/60 px-2.5 py-0.5 text-xs font-medium ring-1 ring-border/60">
                            Level {overview?.campusLevel ?? "-"}
                          </span>
                          {overview?.campusZone && (
                            <span className="inline-flex items-center rounded-lg bg-background/60 px-2.5 py-0.5 text-xs font-medium ring-1 ring-border/60">
                              {overview.campusZone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Right: lead + enabler */}
                    <div className="flex flex-col gap-1 text-sm sm:items-end">
                      <span className="text-muted-foreground">
                        Lead:{" "}
                        <span className="font-semibold text-foreground">
                          {overview?.campusLead ?? "-"}
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        Enabler:{" "}
                        <span className="font-semibold text-foreground">
                          {overview?.enabler ?? "Not assigned"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Bento Grid Stats ── */}
                <div
                  className="grid grid-cols-2 gap-4 md:grid-cols-4"
                  style={{ gridAutoRows: "88px" }}
                >
                  {/* ── Hero: Total Karma ── */}
                  <div className="col-span-1 row-span-2 md:col-span-2">
                    <StatCard
                      title="Total Karma"
                      value={(overview?.totalKarma ?? 0).toLocaleString()}
                      icon={<Zap className="h-4 w-4" />}
                      featured
                      accent="#0d9488"
                    />
                  </div>
                  {/* ── Hero: Global Rank ── */}
                  <div className="col-span-1 row-span-2 md:col-span-2">
                    <StatCard
                      title="Global Rank"
                      value={overview?.rank ? `#${overview.rank}` : "-"}
                      icon={<Trophy className="h-4 w-4" />}
                      featured
                      accent="#f59e0b"
                      accentText="#b45309"
                    />
                  </div>
                </div>

                {/* ── Secondary Stats — single row of 5 ── */}
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  <StatCard
                    title="7-Day Karma"
                    value={(overview?.karma7Day ?? 0).toLocaleString()}
                    icon={<Zap className="h-4 w-4" />}
                  />
                  <StatCard
                    title="30-Day Karma"
                    value={(overview?.karma30Day ?? 0).toLocaleString()}
                    icon={<Zap className="h-4 w-4" />}
                  />
                  <StatCard
                    title="Total Members"
                    value={(overview?.totalMembers ?? 0).toLocaleString()}
                    icon={<Users className="h-4 w-4" />}
                  />
                  <StatCard
                    title="Active Members"
                    value={(overview?.activeMembers ?? 0).toLocaleString()}
                    icon={<Users className="h-4 w-4" />}
                  />
                  <StatCard
                    title="Active IG Chapters"
                    value={overview?.igChaptersCount ?? 0}
                    icon={<BookOpen className="h-4 w-4" />}
                  />
                </div>

                {/* ── Karma Trend Chart — separated card ── */}
                <Card className="mt-4 border-border/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">
                      Karma Trend
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Weekly karma activity over time
                    </p>
                  </CardHeader>
                  <CardContent className="pb-5">
                    {/* Empty-state overlay when all values are zero */}
                    {(() => {
                      const trend = overview?.trend ?? [];
                      const isEmpty =
                        trend.length === 0 || trend.every((p) => p.value === 0);
                      return (
                        <div className="relative h-56 min-w-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={trend}
                              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                            >
                              <defs>
                                <linearGradient
                                  id="karmaGradient"
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="5%"
                                    stopColor="#0d9488"
                                    stopOpacity={0.3}
                                  />
                                  <stop
                                    offset="95%"
                                    stopColor="#0d9488"
                                    stopOpacity={0}
                                  />
                                </linearGradient>
                              </defs>
                              {/* Horizontal lines only */}
                              <CartesianGrid
                                horizontal
                                vertical={false}
                                stroke="currentColor"
                                strokeOpacity={0.07}
                              />
                              <XAxis
                                dataKey="label"
                                tick={{ fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                              />
                              <YAxis
                                allowDecimals={false}
                                tick={{ fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                width={36}
                              />
                              <Tooltip
                                cursor={{
                                  stroke: "#0d9488",
                                  strokeWidth: 1,
                                  strokeDasharray: "4 4",
                                }}
                                contentStyle={{
                                  borderRadius: "10px",
                                  border: "1px solid hsl(var(--border))",
                                  background: "hsl(var(--card))",
                                  boxShadow: "0 8px 30px rgba(0,0,0,.14)",
                                  fontSize: "12px",
                                }}
                              />
                              <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#0d9488"
                                strokeWidth={2}
                                fill="url(#karmaGradient)"
                                dot={false}
                                activeDot={{
                                  r: 4,
                                  fill: "#0d9488",
                                  strokeWidth: 2,
                                  stroke: "#fff",
                                }}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                          {/* Empty-state overlay */}
                          {isEmpty && (
                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                <Zap className="h-4 w-4 text-muted-foreground/50" />
                              </div>
                              <p className="text-xs font-medium text-muted-foreground">
                                No activity recorded this period
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </>
            )}
          </section>

          {/* ── 2. Students / Leaderboard ── */}
          <section>
            <SectionTitle
              title="2. Students / Leaderboard"
              subtitle="Search and filter by IG, cluster and alumni status"
            />

            <div className="mb-4 flex flex-col gap-3 lg:flex-row">
              <Input
                value={leaderboardFilters.search}
                onChange={(e) =>
                  handleLeaderboardFilterChange("search")(e.target.value)
                }
                placeholder="Search students"
                className="max-w-sm"
              />
              <FilterSelect
                value={leaderboardFilters.ig}
                onChange={handleLeaderboardFilterChange("ig")}
                options={[{ label: "All IG", value: "" }, ...igOptions]}
              />
              <FilterSelect
                value={leaderboardFilters.cluster}
                onChange={handleLeaderboardFilterChange("cluster")}
                options={[
                  { label: "All Clusters", value: "" },
                  ...clusterOptions,
                ]}
              />
              <FilterSelect
                value={leaderboardFilters.alumni}
                onChange={handleLeaderboardFilterChange("alumni")}
                options={[
                  { label: "All", value: "all" },
                  { label: "Alumni", value: "alumni" },
                  { label: "Students", value: "student" },
                ]}
              />
            </div>

            {isLeaderboardLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <Card className="border-border/60">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>MUID</TableHead>
                        <TableHead>Karma</TableHead>
                        <TableHead>Rank</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Department / Cluster</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeaderboard.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            {student.name}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {student.id}
                          </TableCell>
                          <TableCell>
                            {student.karma.toLocaleString()}
                          </TableCell>
                          <TableCell>#{student.rank}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {student.level}
                            </Badge>
                          </TableCell>
                          <TableCell>{student.cluster}</TableCell>
                        </TableRow>
                      ))}
                      {filteredLeaderboard.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="py-8 text-center text-muted-foreground"
                          >
                            No leaderboard data for selected filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <div className="p-4">
                    <Pagination
                      currentPage={leaderboardPage}
                      totalPages={totalPages}
                      handleNextClick={() => {
                        const next = Math.min(leaderboardPage + 1, totalPages);
                        setLeaderboardPage(next);
                        setLeaderboardFilters((prev) => ({
                          ...prev,
                          page: next,
                        }));
                      }}
                      handlePreviousClick={() => {
                        const prev = Math.max(leaderboardPage - 1, 1);
                        setLeaderboardPage(prev);
                        setLeaderboardFilters((p) => ({ ...p, page: prev }));
                      }}
                      perPage={PAGE_SIZE}
                      totalCount={
                        leaderboardPagination?.count ??
                        filteredLeaderboard.length
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </section>

          {/* ── Tabs + Social Links side panel ── */}
          <section>
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
              {/* Left: Tabs */}
              <div className="min-w-0 flex-1">
                <Tabs defaultValue="analytics">
                  <TabsList className="mb-4 w-full justify-start">
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                    <TabsTrigger value="execom">Execom</TabsTrigger>
                    <TabsTrigger value="ig">IG Chapters</TabsTrigger>
                  </TabsList>

                  {/* ── Analytics Tab ── */}
                  <TabsContent value="analytics">
                    <div className="grid gap-4 lg:grid-cols-2">
                      {/* Karma by cluster bar chart */}
                      <Card className="border-border/60">
                        <CardHeader>
                          <CardTitle className="text-base">
                            Karma by Cluster
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="h-72 min-w-0">
                          {isClusterLoading ? (
                            <Skeleton className="h-full w-full" />
                          ) : clusterData.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                              <Users className="h-8 w-8 opacity-30" />
                              <p className="text-sm">
                                No cluster data available.
                              </p>
                            </div>
                          ) : (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={clusterData}
                                margin={{
                                  top: 4,
                                  right: 8,
                                  left: 0,
                                  bottom: 0,
                                }}
                              >
                                <CartesianGrid
                                  vertical={false}
                                  stroke="currentColor"
                                  strokeOpacity={0.07}
                                />
                                <XAxis
                                  dataKey="cluster"
                                  tick={{ fontSize: 11 }}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <YAxis
                                  allowDecimals={false}
                                  tick={{ fontSize: 11 }}
                                  tickLine={false}
                                  axisLine={false}
                                  width={36}
                                />
                                <Tooltip
                                  contentStyle={{
                                    borderRadius: "10px",
                                    border: "1px solid hsl(var(--border))",
                                    background: "hsl(var(--card))",
                                    boxShadow: "0 8px 30px rgba(0,0,0,.14)",
                                    fontSize: "12px",
                                  }}
                                />
                                <Bar
                                  dataKey="karma"
                                  fill="#0d9488"
                                  radius={[6, 6, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </CardContent>
                      </Card>

                      {/* Events by tag pie chart */}
                      <Card className="border-border/60">
                        <CardHeader>
                          <CardTitle className="text-base">
                            Events by Tag
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="h-72 min-w-0">
                          {isDistributionLoading ? (
                            <Skeleton className="h-full w-full" />
                          ) : distribution.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                              <CalendarDays className="h-8 w-8 opacity-30" />
                              <p className="text-sm">
                                No event tag data available.
                              </p>
                            </div>
                          ) : (
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={distribution}
                                  dataKey="count"
                                  nameKey="tag"
                                  outerRadius={90}
                                  innerRadius={40}
                                  label
                                >
                                  {distribution.map((entry, index) => (
                                    <Cell
                                      key={`${entry.tag}-${index}`}
                                      fill={
                                        PIE_COLORS[index % PIE_COLORS.length]
                                      }
                                    />
                                  ))}
                                </Pie>
                                <Tooltip
                                  contentStyle={{
                                    borderRadius: "10px",
                                    border: "1px solid hsl(var(--border))",
                                    background: "hsl(var(--card))",
                                    boxShadow: "0 8px 30px rgba(0,0,0,.14)",
                                    fontSize: "12px",
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* ── Events Tab ── */}
                  <TabsContent value="events">
                    <div className="mb-4 flex flex-col gap-3 lg:flex-row">
                      <FilterSelect
                        value={eventFilters.status}
                        onChange={handleEventFilterChange("status")}
                        options={[
                          { label: "All Status", value: "" },
                          { label: "Draft", value: "draft" },
                          { label: "Published", value: "published" },
                          { label: "Ongoing", value: "ongoing" },
                          { label: "Completed", value: "completed" },
                          { label: "Cancelled", value: "cancelled" },
                        ]}
                      />
                      <FilterSelect
                        value={eventFilters.type}
                        onChange={handleEventFilterChange("type")}
                        options={[
                          { label: "All Types", value: "" },
                          { label: "Hackathon", value: "hackathon" },
                          { label: "Workshop", value: "workshop" },
                          { label: "Meetup", value: "meetup" },
                          { label: "Conference", value: "conference" },
                          { label: "Bootcamp", value: "bootcamp" },
                          { label: "Competition", value: "competition" },
                          { label: "Other", value: "other" },
                        ]}
                      />
                      <Input
                        value={eventFilters.date}
                        type="date"
                        onChange={(e) =>
                          handleEventFilterChange("date")(e.target.value)
                        }
                        className="max-w-xs"
                      />
                    </div>

                    {isEventsLoading ? (
                      <Skeleton className="h-52 w-full" />
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {events.map((event) => (
                          <Card
                            key={event.id}
                            className="overflow-hidden border-border/60"
                          >
                            {event.coverImage && (
                              <div className="h-36 w-full overflow-hidden bg-muted">
                                <img
                                  src={event.coverImage}
                                  alt={event.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}
                            <CardHeader className="space-y-2 pb-2">
                              <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-base leading-snug">
                                  {event.title}
                                </CardTitle>
                                <Badge
                                  variant={
                                    event.status === "completed"
                                      ? "secondary"
                                      : event.status === "ongoing" ||
                                          event.status === "published"
                                        ? "default"
                                        : "outline"
                                  }
                                  className="shrink-0 capitalize"
                                >
                                  {event.status}
                                </Badge>
                              </div>
                              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                <CalendarDays className="h-3 w-3 shrink-0" />
                                {event.date
                                  ? new Date(event.date).toLocaleDateString()
                                  : "Date TBD"}
                                {event.endDate &&
                                  event.endDate !== event.date && (
                                    <>
                                      {" → "}
                                      {new Date(
                                        event.endDate,
                                      ).toLocaleDateString()}
                                    </>
                                  )}
                              </p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex flex-wrap gap-1">
                                {event.tags.length > 0 ? (
                                  event.tags.map((tag, index) => (
                                    <Badge
                                      key={`${event.id}-${tag || "tag"}-${index}`}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {tag}
                                    </Badge>
                                  ))
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    No tags
                                  </Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                {event.venueCity && event.venueCity !== "-" && (
                                  <>
                                    <span>City</span>
                                    <span className="font-medium text-foreground capitalize">
                                      {event.venueCity}
                                    </span>
                                  </>
                                )}
                                {event.venueType && event.venueType !== "-" && (
                                  <>
                                    <span>Venue</span>
                                    <span className="font-medium text-foreground capitalize">
                                      {event.venueType}
                                    </span>
                                  </>
                                )}
                                {event.scope && event.scope !== "-" && (
                                  <>
                                    <span>Scope</span>
                                    <span className="font-medium text-foreground capitalize">
                                      {event.scope}
                                    </span>
                                  </>
                                )}
                                {event.organiserType &&
                                  event.organiserType !== "-" && (
                                    <>
                                      <span>Organiser</span>
                                      <span className="font-medium text-foreground capitalize">
                                        {event.organiserType}
                                      </span>
                                    </>
                                  )}
                                <span>Interested</span>
                                <span className="font-semibold text-foreground">
                                  {event.interestCount}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {events.length === 0 && (
                          <Card className="border-dashed md:col-span-2 xl:col-span-3">
                            <CardContent className="py-8 text-center text-muted-foreground">
                              No events matched these filters.
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  {/* ── Execom Tab ── */}
                  <TabsContent value="execom">
                    <Card className="mb-4 border-border/60">
                      <CardHeader>
                        <CardTitle className="text-sm font-semibold">
                          Add Execom Member
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Input
                            value={newMuid}
                            onChange={(e) => setNewMuid(e.target.value)}
                            placeholder="Enter MUID (e.g. john@mulearn)"
                            className="max-w-sm"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddExecom();
                            }}
                          />
                          <Button
                            onClick={handleAddExecom}
                            disabled={isAdding || !newMuid.trim()}
                            size="sm"
                          >
                            {isAdding ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                            <span className="ml-1">Add</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/60">
                      <CardHeader>
                        <CardTitle className="text-sm font-semibold">
                          Current Execom Roster
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isExecomLoading ? (
                          <Skeleton className="h-40 w-full" />
                        ) : execom.length > 0 ? (
                          <div className="space-y-2">
                            {execom.map((member) => (
                              <div
                                key={member.id}
                                className="flex items-center justify-between rounded-xl border border-border/60 p-3"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage
                                      src={member.profilePic || ""}
                                      alt={member.name}
                                    />
                                    <AvatarFallback>
                                      {member.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{member.name}</p>
                                    <p className="font-mono text-[10px] text-muted-foreground">
                                      {member.muid}
                                    </p>
                                    <p className="text-xs uppercase tracking-tight text-muted-foreground">
                                      {member.igChapter}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge variant="secondary">
                                    {member.role}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    disabled={isRemoving}
                                    onClick={() => removeExecom(member.id)}
                                    title="Remove execom role"
                                  >
                                    {isRemoving ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No execom members found.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ── IG Chapters Tab ── */}
                  <TabsContent value="ig">
                    {isChaptersLoading ? (
                      <Skeleton className="h-40 w-full" />
                    ) : chapters.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {chapters.map((chapter) => (
                          <Card key={chapter.id} className="border-border/60">
                            <CardHeader className="pb-2">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-primary" />
                                <CardTitle className="text-base">
                                  {chapter.name}
                                </CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Lead
                                </span>
                                <span className="font-medium">
                                  {chapter.lead}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Members
                                </span>
                                <Badge variant="secondary">
                                  {chapter.membersCount}
                                </Badge>
                              </div>
                              {chapter.execomMembers.length > 0 && (
                                <div className="pt-1">
                                  <p className="mb-1 text-xs text-muted-foreground">
                                    Execom
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {chapter.execomMembers.map((name) => (
                                      <Badge
                                        key={name}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {name}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="border-dashed">
                        <CardContent className="py-8 text-center text-sm text-muted-foreground">
                          No IG chapters found for this campus.
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right: Social Links — permanent side panel */}
              <div className="w-full xl:w-72 xl:shrink-0">
                <Card className="border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">
                      Social Links
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Campus social media presence
                    </p>
                  </CardHeader>
                  <CardContent>
                    {isSocialLoading ? (
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-10 w-full rounded-xl" />
                        <Skeleton className="h-10 w-full rounded-xl" />
                      </div>
                    ) : socialLinks?.instagram || socialLinks?.linkedin ? (
                      <div className="flex flex-col gap-2">
                        {socialLinks.instagram && (
                          <a
                            href={socialLinks.instagram}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex w-full items-center gap-3 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                          >
                            <Instagram className="h-4 w-4 text-pink-500" />
                            Instagram
                          </a>
                        )}
                        {socialLinks.linkedin && (
                          <a
                            href={socialLinks.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex w-full items-center gap-3 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                          >
                            <Linkedin className="h-4 w-4 text-blue-600" />
                            LinkedIn
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No social links configured yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
