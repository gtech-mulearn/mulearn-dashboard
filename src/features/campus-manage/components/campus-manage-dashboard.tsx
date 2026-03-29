"use client";

import { format, isSameDay } from "date-fns";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  CalendarDays,
  ExternalLink,
  Facebook,
  Github,
  Globe,
  Heart,
  Instagram,
  Link2,
  Linkedin,
  Loader2,
  MapPin,
  MessageSquare,
  Pencil,
  Plus,
  PlusCircle,
  Search,
  Trash2,
  Trophy,
  Twitter,
  User,
  Users,
  X,
  Youtube,
  Zap,
} from "lucide-react";
import Image from "next/image";
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
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  useAddExecomMember,
  useCampusEvents,
  useCampusLeaderboard,
  useCampusOverview,
  useDeleteSocialLink,
  useEventDistribution,
  useExecomMembers,
  useIgChapters,
  useKarmaByCluster,
  useRemoveExecomMember,
  useUpsertSocialLink,
  useUserProfile,
} from "../hooks";
import type {
  CampusEventFilters,
  CampusLeaderboardFilters,
  ClusterKarmaPoint,
  SocialLink,
  SocialLinks,
} from "../types";

const PIE_COLORS = ["#16a34a", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6"];
const PAGE_SIZE = 10;

const SOCIAL_PLATFORMS = [
  {
    id: "instagram",
    label: "Instagram",
    icon: Instagram,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    color: "text-blue-600",
    bg: "bg-blue-600/10",
  },
  {
    id: "twitter",
    label: "Twitter",
    icon: Twitter,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: Facebook,
    color: "text-blue-700",
    bg: "bg-blue-700/10",
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: Youtube,
    color: "text-red-600",
    bg: "bg-red-600/10",
  },
  {
    id: "discord",
    label: "Discord",
    icon: MessageSquare,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    id: "github",
    label: "GitHub",
    icon: Github,
    color: "text-slate-800",
    bg: "bg-slate-800/10",
  },
  {
    id: "website",
    label: "Website",
    icon: Globe,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    id: "other",
    label: "Other",
    icon: Link2,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
] as const;

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatDateRange = (start?: string, end?: string) => {
  if (!start) return "Date TBD";
  const startDate = new Date(start);
  if (!end || isSameDay(startDate, new Date(end))) {
    return format(startDate, "MMM d, yyyy");
  }
  const endDate = new Date(end);
  if (
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear()
  ) {
    return `${format(startDate, "MMM d")} - ${format(endDate, "d, yyyy")}`;
  }
  return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
};

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
            {selectedDate ? (
              format(selectedDate, "PPP")
            ) : (
              <span>Select Date</span>
            )}
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

  const { data: chapters = [], isLoading: isChaptersLoading } = useIgChapters();

  const socialLinks = overview?.socialLinks;

  // ─── Execom user verification ──
  const { data: verifiedUser, isFetching: isVerifyingUser } =
    useUserProfile(newMuid);

  // ─── Mutations ───────────────────────────────────────────────────────────
  const { mutate: upsertSocial, isPending: isUpsertingSocial } =
    useUpsertSocialLink();
  const { mutate: deleteSocial, isPending: isDeletingSocial } =
    useDeleteSocialLink();
  const { mutate: addExecom, isPending: isAdding } = useAddExecomMember();
  const { mutate: removeExecom, isPending: isRemoving } =
    useRemoveExecomMember();

  // ─── Social presence state ──
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [socialValue, setSocialValue] = useState("");
  const [isAddingNewSocial, setIsAddingNewSocial] = useState(false);

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
                      {/* Card 1: Karma by Cluster */}
                      <Card className="border-border/60 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            Karma by Cluster
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="h-80 p-0">
                          {isClusterLoading ? (
                            <Skeleton className="m-6 h-64 w-full rounded-xl" />
                          ) : clusterData.length > 0 ? (
                            <div className="h-full w-full p-4">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={clusterData}
                                  layout="vertical"
                                  margin={{
                                    top: 5,
                                    right: 30,
                                    left: 40,
                                    bottom: 5,
                                  }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    horizontal={false}
                                    strokeOpacity={0.1}
                                  />
                                  <XAxis type="number" hide />
                                  <YAxis
                                    dataKey="cluster"
                                    type="category"
                                    tick={{ fontSize: 10, fontWeight: 600 }}
                                    width={80}
                                    axisLine={false}
                                    tickLine={false}
                                  />
                                  <Tooltip
                                    cursor={{ fill: "transparent" }}
                                    content={({ active, payload }) => {
                                      if (active && payload && payload.length) {
                                        const point = payload[0]
                                          .payload as ClusterKarmaPoint;
                                        return (
                                          <div className="rounded-xl border border-border/60 bg-background/95 p-2.5 shadow-xl backdrop-blur-sm">
                                            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                              {point.cluster}
                                            </p>
                                            <div className="flex flex-col gap-0.5">
                                              <p className="text-sm font-black text-primary">
                                                {point.karma?.toLocaleString()}{" "}
                                                Karma
                                              </p>
                                              <p className="text-[11px] font-bold text-muted-foreground">
                                                {point.memberCount?.toLocaleString()}{" "}
                                                Members
                                              </p>
                                            </div>
                                          </div>
                                        );
                                      }
                                      return null;
                                    }}
                                  />
                                  <Bar
                                    dataKey="karma"
                                    fill="hsl(var(--primary))"
                                    radius={[0, 4, 4, 0]}
                                    barSize={20}
                                  >
                                    {clusterData.map((entry, index) => (
                                      <Cell
                                        key={`cell-${entry.cluster}`}
                                        fill={
                                          PIE_COLORS[index % PIE_COLORS.length]
                                        }
                                      />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/40 transition-transform hover:scale-105">
                                <BarChart3 className="h-10 w-10 text-muted-foreground/30" />
                              </div>
                              <h4 className="mb-2 text-lg font-bold tracking-tight text-foreground/80">
                                No Data
                              </h4>
                              <p className="max-w-[200px] text-xs font-medium leading-relaxed text-muted-foreground">
                                No cluster data available for this campus.
                              </p>
                            </div>
                          )}
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
                                    {distribution.reduce(
                                      (acc, curr) => acc + curr.count,
                                      0,
                                    )}
                                  </span>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                    Events
                                  </span>
                                </div>
                              </div>

                              {/* Custom Legend */}
                              <div className="flex flex-1 flex-col gap-3.5 pl-8">
                                {distribution.map((entry, index) => {
                                  const totalDist = distribution.reduce(
                                    (acc, curr) => acc + curr.count,
                                    0,
                                  );
                                  const percentage =
                                    Math.round(
                                      (entry.count / totalDist) * 100,
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
                      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {events.map((event) => (
                          <Card
                            key={event.id}
                            className="group flex flex-col overflow-hidden border-border/60 p-0 gap-0 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
                          >
                            {/* Header Image Area */}
                            {event.coverImage && (
                              <div className="relative aspect-video w-full overflow-hidden">
                                <Image
                                  src={event.coverImage}
                                  alt={event.title}
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              </div>
                            )}

                            {/* Content */}
                            <div className="flex flex-1 flex-col p-5">
                              <div className="mb-4">
                                <h3 className="line-clamp-1 text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                                  {event.title}
                                </h3>
                                <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-primary">
                                  <CalendarDays className="h-4 w-4" />
                                  {formatDateRange(event.date, event.endDate)}
                                </div>
                              </div>

                              {/* Tags */}
                              <div className="mb-5 flex flex-wrap gap-1.5">
                                {event.tags.length > 0 ? (
                                  event.tags.map((tag) => (
                                    <Badge
                                      key={`${event.id}-${tag || "unnamed"}`}
                                      variant="secondary"
                                      className="h-5 bg-muted/50 px-2 text-[10px] font-bold"
                                    >
                                      {tag}
                                    </Badge>
                                  ))
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="h-5 bg-muted/50 px-2 text-[10px] font-bold"
                                  >
                                    No tags
                                  </Badge>
                                )}
                              </div>

                              {/* Information Grid 2x2 */}
                              <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-5">
                                <div className="flex items-start gap-2.5">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="truncate text-xs font-bold capitalize">
                                      {event.venueCity || "Kochi"}
                                    </div>
                                    <div className="text-[10px] uppercase tracking-tighter text-muted-foreground/60">
                                      {event.venueType || "Location"}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="truncate text-xs font-bold capitalize">
                                      {event.scope || "-"}
                                    </div>
                                    <div className="text-[10px] uppercase tracking-tighter text-muted-foreground/60">
                                      Scope
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="truncate text-xs font-bold capitalize">
                                      {event.organiserType || "-"}
                                    </div>
                                    <div className="text-[10px] uppercase tracking-tighter text-muted-foreground/60">
                                      Organizer
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                                    <Trophy className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="truncate text-xs font-bold capitalize">
                                      {event.type || "Event"}
                                    </div>
                                    <div className="text-[10px] uppercase tracking-tighter text-muted-foreground/60">
                                      Category
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Social Proof Footer */}
                            <div className="flex items-center justify-between border-t border-border/40 bg-muted/5 px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <Heart
                                  className={cn(
                                    "h-4 w-4 transition-all duration-300",
                                    event.interestCount > 0
                                      ? "fill-red-500 text-red-500 scale-110"
                                      : "text-muted-foreground",
                                  )}
                                />
                                <span className="text-xs font-bold">
                                  {event.interestCount}{" "}
                                  <span className="font-medium text-muted-foreground">
                                    Interested
                                  </span>
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
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
                  <TabsContent
                    value="execom"
                    className="animate-in fade-in slide-in-from-bottom-2"
                  >
                    <Card className="mb-6 border-border/60 shadow-sm">
                      <CardHeader className="pb-3 text-center sm:text-left">
                        <CardTitle className="text-xl font-bold tracking-tight">
                          Manage Leadership Team
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Appoint members to the campus executive committee
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                          <div className="group relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                            <Input
                              value={newMuid}
                              onChange={(e) => setNewMuid(e.target.value)}
                              placeholder="Enter MUID (e.g. john@mulearn)"
                              className="h-11 rounded-xl border-border/60 pl-10 pr-12 shadow-sm transition-all focus-visible:ring-primary/20"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddExecom();
                              }}
                            />
                            {/* Instant Verification Indicator */}
                            {newMuid.includes("@") && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                {isVerifyingUser ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/50" />
                                ) : verifiedUser?.name ? (
                                  <div className="flex items-center gap-1.5 animate-in zoom-in-90 fade-in">
                                    <div className="h-7 w-7 overflow-hidden rounded-lg shadow-sm border border-border/40">
                                      {verifiedUser.profilePic ? (
                                        <Image
                                          src={verifiedUser.profilePic}
                                          alt=""
                                          width={28}
                                          height={28}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-primary/5">
                                          <User className="h-3.5 w-3.5 text-primary/40" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={handleAddExecom}
                            disabled={isAdding || !newMuid.trim()}
                            className="h-11 rounded-xl px-6 font-bold shadow-lg shadow-primary/10 transition-all hover:shadow-primary/20 active:scale-[0.98]"
                          >
                            {isAdding ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                            <span className="ml-2">Add Member</span>
                          </Button>
                        </div>
                        {verifiedUser?.name && (
                          <p className="mt-2 pl-3 text-[10px] font-bold uppercase tracking-widest text-primary animate-in fade-in slide-in-from-left-1">
                            Found: {verifiedUser.name}
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <SectionTitle
                      title="Current Execom Roster"
                      subtitle="Our campus leadership team for this tenure"
                    />

                    {isExecomLoading ? (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                          <Skeleton
                            key={i}
                            className="h-28 w-full rounded-2xl"
                          />
                        ))}
                      </div>
                    ) : execom.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {execom.map((member) => (
                          <div
                            key={member.id}
                            className="group relative flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
                          >
                            {/* Profile Picture (Strict Policy) */}
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-border/40 bg-muted shadow-sm transition-transform group-hover:scale-105">
                              {member.profilePic ? (
                                <Image
                                  src={member.profilePic}
                                  alt={member.name}
                                  width={64}
                                  height={64}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-primary/[0.03]">
                                  <User className="h-8 w-8 text-primary/10" />
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1 space-y-1">
                              <p className="truncate text-base font-bold tracking-tight text-foreground">
                                {member.name}
                              </p>
                              <div className="flex flex-col gap-0.5">
                                <p className="truncate font-mono text-[10px] font-medium text-muted-foreground/80">
                                  {member.muid}
                                </p>
                                <div className="mt-1 flex flex-wrap gap-1.5">
                                  <Badge
                                    variant="secondary"
                                    className="rounded-lg bg-primary/5 px-2 py-0 text-[10px] font-black uppercase tracking-widest text-primary/80"
                                  >
                                    {member.role === "member"
                                      ? "Execom"
                                      : member.role}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Delete Button (Hover Only) */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-2 h-8 w-8 rounded-full text-destructive opacity-0 transition-all hover:bg-destructive/10 group-hover:opacity-100"
                              disabled={isRemoving}
                              onClick={() => removeExecom(member.id)}
                            >
                              {isRemoving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Card className="border-dashed py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-3">
                          <Users className="h-10 w-10 opacity-10" />
                          <p className="text-sm font-medium">
                            No execom members appointed yet
                          </p>
                        </div>
                      </Card>
                    )}
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
                <Card className="h-full border-border/60 shadow-sm transition-shadow hover:shadow-md/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Social Presence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 p-4 pt-0">
                    {/* Active List */}
                    <div className="flex flex-col gap-2">
                      {SOCIAL_PLATFORMS.map((platform) => {
                        const linkData = socialLinks?.[platform.id] as
                          | SocialLink
                          | undefined;

                        // Show row if it has data OR if we are currently editing it
                        if (!linkData && editingPlatform !== platform.id)
                          return null;

                        const isEditing = editingPlatform === platform.id;

                        return (
                          <div
                            key={platform.id}
                            className="group flex items-center gap-3 rounded-xl border border-transparent p-1.5 transition-all hover:border-border/60 hover:bg-muted/30"
                          >
                            <div
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm transition-transform group-hover:scale-105",
                                platform.bg,
                                platform.color,
                              )}
                            >
                              <platform.icon className="h-4.5 w-4.5" />
                            </div>

                            {isEditing ? (
                              <div className="flex flex-1 items-center gap-1.5 animate-in fade-in slide-in-from-right-2">
                                <Input
                                  value={socialValue}
                                  onChange={(e) =>
                                    setSocialValue(e.target.value)
                                  }
                                  placeholder={`Enter ${platform.label} URL...`}
                                  className="h-8 text-[11px] font-medium"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && socialValue) {
                                      upsertSocial(
                                        {
                                          platform: platform.id,
                                          url: socialValue,
                                        },
                                        {
                                          onSuccess: () =>
                                            setEditingPlatform(null),
                                        },
                                      );
                                    }
                                    if (e.key === "Escape")
                                      setEditingPlatform(null);
                                  }}
                                />
                                <div className="flex shrink-0 items-center gap-0.5">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-green-600 hover:bg-green-50"
                                    disabled={isUpsertingSocial || !socialValue}
                                    onClick={() => {
                                      upsertSocial(
                                        {
                                          platform: platform.id,
                                          url: socialValue,
                                        },
                                        {
                                          onSuccess: () =>
                                            setEditingPlatform(null),
                                        },
                                      );
                                    }}
                                  >
                                    {isUpsertingSocial ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Plus className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-muted-foreground hover:bg-muted"
                                    onClick={() => setEditingPlatform(null)}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex flex-1 flex-col overflow-hidden">
                                  <span className="text-[11px] font-black uppercase tracking-tight text-foreground/80">
                                    {platform.label}
                                  </span>
                                  <a
                                    href={linkData?.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="truncate text-[10px] font-medium text-muted-foreground transition-colors hover:text-primary hover:underline"
                                  >
                                    {linkData?.url}
                                  </a>
                                </div>
                                <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-all duration-200 group-focus-within:opacity-100 group-hover:translate-x-0 group-hover:opacity-100">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 hover:bg-muted"
                                    onClick={() => {
                                      setEditingPlatform(platform.id);
                                      setSocialValue(linkData?.url || "");
                                    }}
                                    title={`Edit ${platform.label}`}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                    disabled={isDeletingSocial}
                                    onClick={() =>
                                      linkData && deleteSocial(linkData.id)
                                    }
                                    title={`Remove ${platform.label}`}
                                  >
                                    {isDeletingSocial ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Empty State */}
                    {(!socialLinks?.items || socialLinks.items.length === 0) &&
                      !editingPlatform &&
                      !isAddingNewSocial && (
                        <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in-95">
                          <div className="mb-4 rounded-full bg-muted/50 p-4 ring-8 ring-muted/20">
                            <PlusCircle className="h-7 w-7 text-muted-foreground/30" />
                          </div>
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
                            Connect Social Presence
                          </h4>
                          <p className="mt-1 text-[10px] font-medium text-muted-foreground/40">
                            Display your official links to the community
                          </p>
                        </div>
                      )}

                    {/* Add Workflow */}
                    {isAddingNewSocial ? (
                      <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border/60 bg-muted/10 p-2 animate-in fade-in slide-in-from-bottom-2">
                        <Select
                          onValueChange={(val) => {
                            setEditingPlatform(val);
                            setSocialValue("");
                            setIsAddingNewSocial(false);
                          }}
                        >
                          <SelectTrigger className="h-9 rounded-lg text-xs font-black uppercase tracking-tight">
                            <SelectValue placeholder="PLATFORM" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {SOCIAL_PLATFORMS.filter(
                              (p) => !socialLinks?.[p.id as keyof SocialLinks],
                            ).map((p) => (
                              <SelectItem
                                key={p.id}
                                value={p.id}
                                className="text-xs font-bold uppercase tracking-tight"
                              >
                                <div className="flex items-center gap-2">
                                  <p.icon className={cn("h-3 w-3", p.color)} />
                                  {p.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-foreground"
                          onClick={() => setIsAddingNewSocial(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="mt-2 h-10 w-full gap-2 rounded-xl border-dashed border-border/60 text-[11px] font-black uppercase tracking-widest transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-[0.98]"
                        onClick={() => setIsAddingNewSocial(true)}
                      >
                        <PlusCircle className="h-4 w-4" />
                        Add Social Link
                      </Button>
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
