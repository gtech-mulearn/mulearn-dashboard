"use client";

import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ExternalLink,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Loader2,
  Plus,
  Search,
  Trash2,
  Trophy,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { format, isSameDay } from "date-fns";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
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
    <div className="relative group">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full min-w-[140px] appearance-none rounded-full border border-border/60 bg-background pl-4 pr-10 text-[11px] font-semibold uppercase tracking-wider transition-all hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground/40 group-hover:text-primary/60">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-label="Chevron Down"
          role="img"
        >
          <title>Chevron Down</title>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}

function CampusDatePicker({
  date,
  onChange,
}: {
  date: string;
  onChange: (date: string) => void;
}) {
  const selectedDate = date ? new Date(date) : undefined;

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-9 w-full min-w-[160px] justify-start rounded-full border-border/60 bg-background px-4 text-left text-[11px] font-semibold uppercase tracking-wider transition-all hover:border-primary/50 focus:ring-2 focus:ring-primary/20",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarDays className="mr-2 h-3.5 w-3.5 opacity-60" />
            {date ? format(selectedDate!, "PPP") : <span>Select Date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : "")}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {date && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted"
          onClick={() => onChange("")}
          title="Clear date filter"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
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
  const unfilteredEvents = eventsData?.items ?? [];

  const events = useMemo(() => {
    if (!eventFilters.date) return unfilteredEvents;
    const filterDate = new Date(eventFilters.date);
    filterDate.setHours(0, 0, 0, 0);

    return unfilteredEvents.filter((event) => {
      if (!event.date) return false;
      const start = new Date(event.date);
      start.setHours(0, 0, 0, 0);
      const end = event.endDate ? new Date(event.endDate) : start;
      end.setHours(0, 0, 0, 0);

      return filterDate >= start && filterDate <= end;
    });
  }, [unfilteredEvents, eventFilters.date]);

  const filteredLeaderboard = useMemo(() => {
    const query = leaderboardFilters.search.trim().toLowerCase();
    const filtered = leaderboard.filter((item) => {
      if (query && !item.name.toLowerCase().includes(query)) return false;
      return true;
    });
    // Explicitly ensure sorting by rank
    return [...filtered].sort((a, b) => a.rank - b.rank);
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
                  {["s1", "s2", "s3", "s4", "s5", "s6", "s7"].map((id) => (
                    <Skeleton key={id} className="h-24 w-full rounded-2xl" />
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

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  value={leaderboardFilters.search}
                  onChange={(e) =>
                    handleLeaderboardFilterChange("search")(e.target.value)
                  }
                  placeholder="Search students..."
                  className="rounded-full border-border/60 pl-10 h-10 shadow-sm transition-all focus-visible:ring-primary/20"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <FilterSelect
                  value={leaderboardFilters.ig}
                  onChange={handleLeaderboardFilterChange("ig")}
                  options={[
                    { label: "Interest Group", value: "" },
                    ...igOptions,
                  ]}
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
                    { label: "Status: All", value: "all" },
                    { label: "Status: Alumni", value: "alumni" },
                    { label: "Status: Student", value: "student" },
                  ]}
                />
              </div>
            </div>

            {isLeaderboardLoading ? (
              <Skeleton className="h-[500px] w-full rounded-2xl" />
            ) : (
              <Card className="overflow-hidden border-border/60 shadow-md">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-24 text-center">Rank</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Karma</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Department / Cluster</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeaderboard.map((student) => (
                        <TableRow
                          key={student.id}
                          className="group transition-colors hover:bg-muted/50"
                        >
                          <TableCell className="text-center font-bold">
                            <div
                              className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xs font-black shadow-sm transition-all duration-300 ${
                                student.rank === 1
                                  ? "bg-amber-100 text-amber-600 ring-2 ring-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.25)] dark:bg-amber-900/40 dark:text-amber-400"
                                  : student.rank === 2
                                    ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                    : student.rank === 3
                                      ? "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                                      : "bg-background text-muted-foreground border border-border/50"
                              }`}
                            >
                              #{student.rank}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold tracking-tight transition-colors group-hover:text-primary">
                                {student.name}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                @{student.muid.split("@")[0]}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-lg font-black tracking-tighter text-emerald-600 dark:text-emerald-500">
                              {student.karma.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`h-6 px-2.5 font-bold uppercase tracking-wider text-[10px] shadow-sm ${
                                student.level?.includes("7")
                                  ? "bg-purple-600 hover:bg-purple-700"
                                  : student.level?.includes("6")
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : student.level?.includes("5")
                                      ? "bg-indigo-600 hover:bg-indigo-700 font-black"
                                      : student.level?.includes("4")
                                        ? "bg-teal-600 hover:bg-teal-700 font-black"
                                        : "bg-slate-500/80 hover:bg-slate-500 font-black"
                              }`}
                            >
                              {student.level}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                            {student.cluster}
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredLeaderboard.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="py-12 text-center text-muted-foreground"
                          >
                            <div className="flex flex-col items-center gap-2 opacity-50">
                              <Users className="h-10 w-10" />
                              <p className="text-sm">
                                No students found matching your filters.
                              </p>
                            </div>
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

          {/* ── Dashboard Content Area ── */}
          <section className="p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
              {/* Left Column: Content (75%) */}
              <div className="w-full lg:w-3/4">
                <Tabs defaultValue="analytics" className="w-full">
                  <TabsList className="mb-6 h-auto w-full justify-start gap-4 rounded-none border-b bg-transparent p-0">
                    {["analytics", "events", "execom", "ig"].map((tab) => (
                      <TabsTrigger
                        key={tab}
                        value={tab}
                        className="rounded-none border-b-2 border-transparent px-2 pb-3 pt-0 text-sm font-semibold capitalize tracking-tight transition-all data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-primary/70"
                      >
                        {tab === "ig" ? "IG Chapters" : tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* ── Analytics Tab ── */}
                  <TabsContent value="analytics">
                    <div className="grid gap-4 lg:grid-cols-2">
                      {/* Card 1: Karma by Cluster (No Data state) */}
                      <Card className="border-border/60 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            Karma by Cluster
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex h-80 flex-col items-center justify-center p-8 text-center">
                          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/40 transition-transform hover:scale-105">
                            <BarChart3 className="h-10 w-10 text-muted-foreground/30" />
                          </div>
                          <h4 className="mb-2 text-lg font-bold tracking-tight text-foreground/80">
                            Coming Soon
                          </h4>
                          <p className="max-w-[200px] text-xs font-medium leading-relaxed text-muted-foreground">
                            Cluster-level analytics for this campus are
                            currently being processed.
                          </p>
                        </CardContent>
                      </Card>

                      {/* Card 2: Events by Tag (Donut Chart) */}
                      <Card className="border-border/60 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            Events by Tag
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="h-80 p-0">
                          {isDistributionLoading ? (
                            <Skeleton className="m-6 h-64 w-full rounded-xl" />
                          ) : (
                            <div className="flex h-full items-center justify-between px-6">
                              {/* Donut Chart Container */}
                              <div className="relative h-full w-[180px] shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={
                                        distribution.length > 0
                                          ? distribution
                                          : [{ tag: "Empty", count: 1 }]
                                      }
                                      dataKey="count"
                                      nameKey="tag"
                                      innerRadius={65}
                                      outerRadius={85}
                                      paddingAngle={5}
                                      stroke="transparent"
                                      className="outline-none"
                                    >
                                      {(distribution.length > 0
                                        ? distribution
                                        : [{ tag: "Empty", count: 1 }]
                                      ).map((entry, index) => (
                                        <Cell
                                          key={`cell-${entry.tag}`}
                                          fill={
                                            distribution.length > 0
                                              ? PIE_COLORS[
                                                  index % PIE_COLORS.length
                                                ]
                                              : "#f1f5f9"
                                          }
                                          className="transition-opacity hover:opacity-80"
                                        />
                                      ))}
                                    </Pie>
                                    <Tooltip
                                      content={({ active, payload }) => {
                                        if (
                                          active &&
                                          payload &&
                                          payload.length &&
                                          distribution.length > 0
                                        ) {
                                          return (
                                            <div className="rounded-xl border border-border/60 bg-background/95 p-2.5 shadow-xl backdrop-blur-sm">
                                              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                {payload[0].name}
                                              </p>
                                              <p className="text-sm font-black text-primary">
                                                {payload[0].value} Events
                                              </p>
                                            </div>
                                          );
                                        }
                                        return null;
                                      }}
                                    />
                                  </PieChart>
                                </ResponsiveContainer>
                                {/* Center Label */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                  <span className="text-3xl font-black tracking-tighter text-primary">
                                    {events.length}
                                  </span>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                    Events
                                  </span>
                                </div>
                              </div>

                              {/* Custom Legend */}
                              <div className="flex flex-1 flex-col gap-3.5 pl-8">
                                {distribution.map((entry, index) => {
                                  const percentage =
                                    Math.round(
                                      (entry.count / events.length) * 100,
                                    ) || 0;
                                  return (
                                    <div
                                      key={entry.tag}
                                      className="group/item flex flex-col gap-0.5"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="h-2.5 w-2.5 shrink-0 rounded-full transition-transform group-hover/item:scale-125"
                                          style={{
                                            backgroundColor:
                                              PIE_COLORS[
                                                index % PIE_COLORS.length
                                              ],
                                          }}
                                        />
                                        <span className="max-w-[100px] truncate text-xs font-bold tracking-tight text-foreground/80">
                                          {entry.tag}
                                        </span>
                                      </div>
                                      <span className="ml-4.5 text-[10px] font-bold text-muted-foreground transition-colors group-hover/item:text-primary/70">
                                        {percentage}% of total
                                      </span>
                                    </div>
                                  );
                                })}
                                {distribution.length === 0 && (
                                  <p className="text-[11px] font-medium italic text-muted-foreground">
                                    No tags recorded
                                  </p>
                                )}
                              </div>
                            </div>
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
                      <CampusDatePicker
                        date={eventFilters.date}
                        onChange={handleEventFilterChange("date")}
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
                                  event.tags.map((tag) => (
                                    <Badge
                                      key={`${event.id}-${tag || "unnamed"}`}
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
                            <CardContent className="py-12 text-center text-muted-foreground">
                              <div className="flex flex-col items-center gap-4">
                                <CalendarDays className="h-10 w-10 opacity-20" />
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-foreground">
                                    No events found
                                  </p>
                                  <p className="text-xs opacity-70">
                                    Try adjusting your filters to find what
                                    you're looking for.
                                  </p>
                                </div>
                                {(eventFilters.date ||
                                  eventFilters.status ||
                                  eventFilters.type) && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setEventFilters({
                                        page: 1,
                                        status: "",
                                        type: "",
                                        date: "",
                                      })
                                    }
                                    className="mt-2 rounded-full border-primary/20 hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                                  >
                                    View All Events
                                  </Button>
                                )}
                              </div>
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

              {/* Right Column: Social Presence Sidebar (25%) */}
              <div className="w-full lg:w-1/4">
                <Card className="h-full border-border/60 shadow-sm transition-shadow hover:shadow-md">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Social Presence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 p-4 pt-0">
                    {[
                      {
                        id: "instagram",
                        label: "Instagram",
                        icon: Instagram,
                        url: socialLinks?.instagram,
                      },
                      {
                        id: "linkedin",
                        label: "LinkedIn",
                        icon: Linkedin,
                        url: socialLinks?.linkedin,
                      },
                      {
                        id: "github",
                        label: "GitHub",
                        icon: Github,
                        url: null,
                      },
                      {
                        id: "website",
                        label: "Website",
                        icon: Globe,
                        url: null,
                      },
                    ].map((link) => (
                      <div key={link.id} className="group relative">
                        <Button
                          variant="ghost"
                          className={`h-11 w-full justify-start gap-3 rounded-xl px-4 transition-all duration-300 ${
                            !link.url
                              ? "cursor-not-allowed opacity-40 grayscale"
                              : "hover:bg-primary/5 hover:text-primary active:scale-[0.98]"
                          }`}
                          asChild={!!link.url}
                        >
                          {link.url ? (
                            <a href={link.url} target="_blank" rel="noreferrer">
                              <link.icon className="h-4.5 w-4.5" />
                              <span className="text-sm font-bold tracking-tight">
                                {link.label}
                              </span>
                              <ExternalLink className="ml-auto h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                            </a>
                          ) : (
                            <div className="flex w-full items-center">
                              <link.icon className="h-4.5 w-4.5" />
                              <span className="text-sm font-bold tracking-tight">
                                {link.label}
                              </span>
                              <Badge
                                variant="outline"
                                className="ml-auto border-dashed text-[8px] font-black uppercase tracking-tighter opacity-80"
                              >
                                Not Linked
                              </Badge>
                            </div>
                          )}
                        </Button>
                      </div>
                    ))}
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
