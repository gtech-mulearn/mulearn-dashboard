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
import DataTable, { type Data } from "@/components/dashboard/table/Table";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MuidSearchInput } from "@/components/ui/muid-search-input";
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
  CampusLeaderboardItem,
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
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  className?: string;
}) {
  return (
    <div className="relative group">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-9 w-full min-w-[140px] appearance-none rounded-full border border-border/60 bg-background pl-4 pr-10 text-[11px] font-semibold uppercase tracking-wider transition-all hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
          className,
        )}
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
            className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight"
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
  const [newMuids, setNewMuids] = useState<string[]>([]);

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
  const { data: verifiedUser } = useUserProfile(newMuids[0] || "");

  // ─── Mutations ───────────────────────────────────────────────────────────
  const { mutate: upsertSocial, isPending: isUpsertingSocial } =
    useUpsertSocialLink();
  const { mutate: deleteSocial } = useDeleteSocialLink();
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
      chapters
        .map((ch) => ({ label: ch.name, value: ch.igId || ch.id }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [chapters],
  );

  const clusterOptions = useMemo(
    () =>
      clusterData
        .map((cl) => ({ label: cl.cluster, value: cl.cluster }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [clusterData],
  );

  const [sortBy, setSortBy] = useState<string>("");

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
    if (newMuids.length === 0) return;
    newMuids.forEach((muid) => {
      addExecom(muid);
    });
    setNewMuids([]);
  };

  const handleSort = (column: string) => {
    setSortBy((prev) => (prev === column ? `-${column}` : column));
  };

  const sortedLeaderboard = useMemo(() => {
    if (!sortBy) return filteredLeaderboard;

    const isDesc = sortBy.startsWith("-");
    const column = isDesc ? sortBy.slice(1) : sortBy;

    return [...filteredLeaderboard].sort((a, b) => {
      const valA = a[column as keyof CampusLeaderboardItem];
      const valB = b[column as keyof CampusLeaderboardItem];

      if (typeof valA === "number" && typeof valB === "number") {
        return isDesc ? valB - valA : valA - valB;
      }
      return isDesc
        ? String(valB).localeCompare(String(valA))
        : String(valA).localeCompare(String(valB));
    });
  }, [filteredLeaderboard, sortBy]);

  const leaderboardColumns = useMemo(
    () => [
      { column: "rank", Label: "Rank", isSortable: true, width: "w-24" },
      { column: "name", Label: "Student", isSortable: true },
      { column: "karma", Label: "Karma", isSortable: true },
      { column: "level", Label: "Level", isSortable: true },
      { column: "cluster", Label: "Department / Cluster", isSortable: true },
    ],
    [],
  );

  const customCellRender = (column: string, rowData: Data) => {
    const row = rowData as unknown as CampusLeaderboardItem;
    if (column === "rank") {
      return (
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black shadow-lg shadow-chart-1/20 transition-all duration-300 ${
            row.rank === 1
              ? "bg-chart-1/15 text-chart-1 ring-2 ring-chart-1/40"
              : row.rank === 2
                ? "bg-muted text-muted-foreground"
                : row.rank === 3
                  ? "bg-chart-5/15 text-chart-5"
                  : "bg-background text-muted-foreground border border-border/50"
          }`}
        >
          #{row.rank}
        </div>
      );
    }
    if (column === "name") {
      return (
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight transition-colors group-hover:text-primary">
            {row.name}
          </span>
          <span className="text-[11px] text-muted-foreground">
            @{row.muid.split("@")[0]}
          </span>
        </div>
      );
    }
    if (column === "karma") {
      return (
        <span className="text-lg font-black tracking-tighter text-chart-2">
          {row.karma?.toLocaleString()}
        </span>
      );
    }
    if (column === "level") {
      return (
        <Badge
          className={`h-6 px-2.5 font-bold uppercase tracking-wider text-[10px] shadow-sm ${
            row.level?.includes("7")
              ? "bg-chart-5 hover:opacity-90"
              : row.level?.includes("6")
                ? "bg-primary hover:opacity-90"
                : row.level?.includes("5")
                  ? "bg-chart-1 hover:opacity-90 font-black"
                  : row.level?.includes("4")
                    ? "bg-chart-2 hover:opacity-90 font-black"
                    : "bg-muted text-muted-foreground hover:bg-muted font-black"
          }`}
        >
          {row.level}
        </Badge>
      );
    }
    return null;
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
                  <div className="absolute inset-0 bg-gradient-to-br from-chart-2/20 via-primary/10 to-chart-5/20" />
                  <div className="absolute inset-0 backdrop-blur-[2px]" />
                  {/* subtle grid pattern */}
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(0deg,transparent,transparent 24px,currentColor 24px,currentColor 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,currentColor 24px,currentColor 25px)",
                    }}
                  />
                  <div className="relative flex flex-col gap-5 px-4 py-6 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
                    {/* Left: avatar + college info */}
                    <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                      {/* Initials avatar */}
                      <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-chart-2 to-primary text-base sm:text-lg font-bold text-white shadow-lg">
                        {(overview?.campusCode ?? overview?.collegeName ?? "C")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold leading-tight tracking-tight text-foreground truncate">
                          {overview?.collegeName ?? "-"}
                        </h3>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center rounded-lg bg-background/60 px-2 py-0.5 text-[10px] sm:text-xs font-semibold ring-1 ring-border/40">
                            {overview?.campusCode ?? "-"}
                          </span>
                          <span className="inline-flex items-center rounded-lg bg-background/60 px-2 py-0.5 text-[10px] sm:text-xs font-semibold ring-1 ring-border/40">
                            Lvl {overview?.campusLevel ?? "-"}
                          </span>
                          {overview?.campusZone && (
                            <span className="max-w-[80px] truncate inline-flex items-center rounded-lg bg-background/60 px-2 py-0.5 text-[10px] sm:text-xs font-semibold ring-1 ring-border/40">
                              {overview.campusZone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Right: lead + enabler */}
                    <div className="flex flex-col gap-1.5 text-xs sm:text-sm sm:items-end border-t border-border/10 pt-4 sm:border-0 sm:pt-0">
                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        <span className="opacity-60 text-[10px] uppercase tracking-widest">
                          Lead:
                        </span>
                        <span className="font-bold truncate max-w-[120px] sm:max-w-none">
                          {overview?.campusLead ?? "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        <span className="opacity-60 text-[10px] uppercase tracking-widest">
                          Enabler:
                        </span>
                        <span className="font-bold truncate max-w-[120px] sm:max-w-none">
                          {overview?.enabler ?? "Not assigned"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                  {/* ── Hero: Total Karma ── */}
                  <div className="sm:col-span-1 md:col-span-2">
                    <StatCard
                      title="Total Karma"
                      value={(overview?.totalKarma ?? 0).toLocaleString()}
                      icon={<Zap className="h-4 w-4" />}
                      featured
                      accent="var(--chart-2)"
                    />
                  </div>
                  {/* ── Hero: Global Rank ── */}
                  <div className="sm:col-span-1 md:col-span-2">
                    <StatCard
                      title="Global Rank"
                      value={overview?.rank ? `#${overview.rank}` : "-"}
                      icon={<Trophy className="h-4 w-4" />}
                      featured
                      accent="var(--chart-1)"
                      accentText="var(--chart-1)"
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
                  <CardHeader className="py-4 px-4">
                    <CardTitle className="text-sm font-semibold">
                      Karma Trend
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Weekly karma activity over time
                    </p>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
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
                              margin={{
                                top: 4,
                                right: 30,
                                left: 30,
                                bottom: 0,
                              }}
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
                                width={44}
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
                          {/* Centralized high-visibility empty-state background overlay */}
                          {isEmpty && (
                            <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center p-4">
                              <div className="flex animate-in fade-in zoom-in-95 flex-col items-center gap-1.5 rounded-2xl bg-muted/10 p-5 backdrop-blur-[1px] ring-1 ring-border/10">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shadow-inner opacity-40">
                                  <Zap className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70 text-center max-w-[150px]">
                                  No activity recorded this period
                                </p>
                              </div>
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

            <div className="mb-6 flex flex-col gap-5">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="group relative flex-1 min-w-0 max-w-full lg:max-w-md">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    value={leaderboardFilters.search}
                    onChange={(e) =>
                      handleLeaderboardFilterChange("search")(e.target.value)
                    }
                    placeholder="Search students by name or MUID..."
                    className="h-12 w-full rounded-2xl border-border/60 bg-muted/20 pl-11 shadow-sm transition-all focus-visible:ring-primary/20 placeholder:text-muted-foreground/40"
                  />
                </div>

                {/* 3 Redesigned Dropdowns - Horizontal Scroll Rail for Mobile */}
                <div className="flex w-full items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1 pt-0.5 lg:w-auto lg:flex-wrap lg:overflow-visible lg:pb-0">
                  <div className="flex shrink-0 items-center">
                    <FilterSelect
                      value={leaderboardFilters.ig}
                      onChange={handleLeaderboardFilterChange("ig")}
                      options={[
                        { label: "Interest Group", value: "" },
                        ...igOptions,
                      ]}
                      className="h-9 min-w-[130px] rounded-full border-border/40 bg-card text-[9px] font-black uppercase tracking-widest transition-all hover:border-primary/40 hover:bg-muted/30 lg:h-11 lg:min-w-[140px] lg:text-[10px]"
                    />
                  </div>
                  <div className="flex shrink-0 items-center">
                    <FilterSelect
                      value={leaderboardFilters.cluster}
                      onChange={handleLeaderboardFilterChange("cluster")}
                      options={[
                        { label: "All Clusters", value: "" },
                        ...clusterOptions,
                      ]}
                      className="h-9 min-w-[120px] rounded-full border-border/40 bg-card text-[9px] font-black uppercase tracking-widest transition-all hover:border-primary/40 hover:bg-muted/30 lg:h-11 lg:min-w-[130px] lg:text-[10px]"
                    />
                  </div>
                  <div className="flex shrink-0 items-center">
                    <FilterSelect
                      value={leaderboardFilters.alumni}
                      onChange={handleLeaderboardFilterChange("alumni")}
                      options={[
                        { label: "Status: All", value: "all" },
                        { label: "Status: Alumni", value: "alumni" },
                        { label: "Status: Student", value: "student" },
                      ]}
                      className="h-9 min-w-[120px] rounded-full border-border/40 bg-card text-[9px] font-black uppercase tracking-widest transition-all hover:border-primary/40 hover:bg-muted/30 lg:h-11 lg:min-w-[130px] lg:text-[10px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DataTable
              rows={sortedLeaderboard}
              columnOrder={leaderboardColumns}
              customCellRender={customCellRender}
              page={leaderboardPage}
              perPage={PAGE_SIZE}
              isloading={isLeaderboardLoading}
            >
              <THead
                key="header"
                columnOrder={leaderboardColumns}
                onIconClick={handleSort}
                action={false}
              />
              <Pagination
                key="pagination"
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
                  leaderboardPagination?.count ?? filteredLeaderboard.length
                }
              />
            </DataTable>
          </section>

          {/* ── Dashboard Content Area ── */}
          <section>
            <div className="flex flex-col gap-8 lg:flex-row">
              {/* Main Column: Content */}
              <div className="flex-1 min-w-0">
                <Tabs defaultValue="analytics" className="w-full">
                  <div className="mb-8 flex justify-start sm:justify-center overflow-x-auto no-scrollbar px-4 py-3">
                    <TabsList className="h-auto inline-flex items-center gap-2 rounded-full bg-muted/40 p-1.5 backdrop-blur-sm shadow-inner min-w-max overflow-visible border-none ring-0">
                      {["analytics", "events", "execom", "ig"].map((tab) => (
                        <TabsTrigger
                          key={tab}
                          value={tab}
                          className="h-10 sm:h-11 shrink-0 rounded-full px-6 sm:px-10 text-xs sm:text-sm font-black capitalize text-foreground transition-all duration-300 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/10 hover:text-primary/70 border-none ring-0"
                        >
                          {tab === "ig" ? "IG Chapters" : tab}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  {/* ── Analytics Tab ── */}
                  <TabsContent value="analytics">
                    <div className="grid gap-4 lg:grid-cols-2">
                      {/* Card 1: Karma by Cluster */}
                      <Card className="border-border/60 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="py-4 px-4">
                          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            Karma by Cluster
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 min-h-[340px]">
                          {isClusterLoading ? (
                            <Skeleton className="m-4 h-56 w-full rounded-xl" />
                          ) : clusterData.length > 0 ? (
                            <div className="h-full w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={clusterData}
                                  layout="vertical"
                                  barSize={20}
                                  margin={{
                                    top: 10,
                                    right: 35,
                                    left: 35,
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
                                    tick={{ fontSize: 10, fontWeight: 700 }}
                                    width={60}
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
                        <CardHeader className="py-4 px-4">
                          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            Events by Tag
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          {isDistributionLoading ? (
                            <Skeleton className="m-6 h-48 w-full rounded-xl" />
                          ) : (
                            <div className="flex flex-col items-center gap-6 p-4 sm:p-6 min-h-[340px]">
                              {/* Donut Chart Container */}
                              <div className="relative h-[200px] w-[200px] shrink-0">
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
                                      paddingAngle={4}
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

                              {/* Custom Legend - Scrollable if too many items */}
                              <div className="flex w-full flex-col gap-3 max-h-[140px] overflow-y-auto no-scrollbar py-2 mt-2">
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
                                      className="group/item flex items-center justify-between w-full px-4 sm:px-6"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div
                                          className="h-2.5 w-2.5 shrink-0 rounded-full transition-transform group-hover/item:scale-125"
                                          style={{
                                            backgroundColor:
                                              PIE_COLORS[
                                                index % PIE_COLORS.length
                                              ],
                                          }}
                                        />
                                        <span className="truncate text-xs font-black tracking-tight text-foreground/80 lowercase">
                                          #{entry.tag}
                                        </span>
                                      </div>
                                      <span className="text-[10px] font-bold text-muted-foreground transition-colors group-hover/item:text-primary/70">
                                        {percentage}% of total
                                      </span>
                                    </div>
                                  );
                                })}
                                {distribution.length === 0 && (
                                  <div className="flex flex-col items-center justify-center py-4 text-center">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/40">
                                      No Data recorded
                                    </p>
                                  </div>
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
                    <div className="mb-6 flex flex-wrap items-center gap-3">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {events.map((event) => (
                          <Card
                            key={event.id}
                            className="group flex flex-col overflow-hidden border-border/60 p-0 gap-0 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
                          >
                            {/* Header Image Area */}
                            {event.coverImage ? (
                              <div className="relative aspect-video w-full overflow-hidden shrink-0">
                                <Image
                                  src={event.coverImage}
                                  alt={event.title}
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              </div>
                            ) : (
                              <div className="flex aspect-video w-full items-center justify-center bg-muted/30 shrink-0">
                                <CalendarDays className="h-10 w-10 text-muted-foreground/30" />
                              </div>
                            )}

                            {/* Content */}
                            <div className="flex flex-1 flex-col p-5">
                              <div className="mb-4">
                                <h3 className="line-clamp-2 text-base sm:text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                                  {event.title}
                                </h3>
                                <div className="mt-2 flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary">
                                  <CalendarDays className="h-3.5 w-3.5" />
                                  {formatDateRange(event.date, event.endDate)}
                                </div>
                              </div>

                              {/* Tags (Scrollable on tiny screens) */}
                              <div className="mb-5 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth pb-0.5">
                                {event.tags.length > 0 ? (
                                  event.tags.map((tag) => (
                                    <Badge
                                      key={`${event.id}-${tag || "unnamed"}`}
                                      variant="secondary"
                                      className="h-5 shrink-0 bg-muted/60 px-2 text-[9px] font-bold uppercase tracking-wider"
                                    >
                                      {tag}
                                    </Badge>
                                  ))
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="h-5 shrink-0 bg-muted/60 px-2 text-[9px] font-bold uppercase tracking-wider"
                                  >
                                    No tags
                                  </Badge>
                                )}
                              </div>

                              {/* Information Grid 2x2 with responsive columns */}
                              <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-t border-border/40 pt-5 mt-auto">
                                <div className="flex items-start gap-2.5">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-[11px] font-bold capitalize leading-none">
                                      {event.venueCity || "Kochi"}
                                    </p>
                                    <p className="mt-1 text-[9px] uppercase tracking-tighter text-muted-foreground/60 font-bold">
                                      {event.venueType || "Location"}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-[11px] font-bold capitalize leading-none">
                                      {event.scope || "-"}
                                    </p>
                                    <p className="mt-1 text-[9px] uppercase tracking-tighter text-muted-foreground/60 font-bold">
                                      Scope
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-[11px] font-bold capitalize leading-none">
                                      {event.organiserType || "-"}
                                    </p>
                                    <p className="mt-1 text-[9px] uppercase tracking-tighter text-muted-foreground/60 font-bold">
                                      Organizer
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                                    <Trophy className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-[11px] font-bold capitalize leading-none">
                                      {event.type || "Event"}
                                    </p>
                                    <p className="mt-1 text-[9px] uppercase tracking-tighter text-muted-foreground/60 font-bold">
                                      Category
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Social Proof Footer */}
                            <div className="flex items-center justify-between border-t border-border/40 bg-muted/5 px-5 py-3.5 mt-auto">
                              <div className="flex items-center gap-2">
                                <Heart
                                  className={cn(
                                    "h-4 w-4",
                                    event.interestCount > 0
                                      ? "fill-red-500 text-red-500"
                                      : "text-muted-foreground",
                                  )}
                                />
                                <span className="text-xs font-bold tabular-nums">
                                  {event.interestCount}{" "}
                                  <span className="font-medium text-muted-foreground/70">
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
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                          <div className="flex-1 min-w-0">
                            <MuidSearchInput
                              value={newMuids}
                              onChange={setNewMuids}
                              placeholder="Enter MUID (e.g. john@mulearn)"
                            />
                            {verifiedUser?.name && (
                              <p className="mt-2.5 pl-3 text-[10px] font-black uppercase tracking-widest text-primary animate-in fade-in slide-in-from-left-1">
                                Identified: {verifiedUser.name}
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={handleAddExecom}
                            disabled={isAdding || newMuids.length === 0}
                            className="h-11 rounded-2xl px-8 font-black shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98] bg-primary hover:bg-primary/90 shrink-0"
                          >
                            {isAdding ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                            <span className="ml-2">Add Member</span>
                          </Button>
                        </div>
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

                            {/* Info Container with padding to prevent button overlap */}
                            <div className="min-w-0 flex-1 space-y-1.5 pr-8">
                              <p className="truncate text-[15px] font-bold tracking-tight text-foreground">
                                {member.name}
                              </p>
                              <div className="flex flex-col gap-1">
                                <p className="truncate font-mono text-[9px] font-semibold text-muted-foreground/60">
                                  {member.muid}
                                </p>
                                <div className="mt-0.5 flex flex-wrap gap-1">
                                  <Badge
                                    variant="secondary"
                                    className="rounded-lg bg-primary/5 px-2 py-0 text-[9px] font-black uppercase tracking-widest text-primary/80 ring-1 ring-primary/10"
                                  >
                                    {member.role === "member"
                                      ? "Execom"
                                      : member.role}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Delete Button - Fixed accessibility and visibility */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-3 top-3 h-7 w-7 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all lg:opacity-0 lg:group-hover:opacity-100"
                              disabled={isRemoving}
                              onClick={() => removeExecom(member.id)}
                            >
                              {isRemoving ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
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
                <Card className="border-border/60 shadow-sm transition-shadow hover:shadow-md/20 overflow-hidden">
                  <CardHeader className="py-2.5 px-4 bg-muted/30 border-b border-border/40">
                    <CardTitle className="text-[11px] font-black uppercase tracking-widest text-foreground/70">
                      Social Presence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {/* View Mode Grid / Edit Mode List */}
                    <div
                      className={cn(
                        "flex gap-3",
                        editingPlatform ? "flex-col" : "flex-wrap",
                      )}
                    >
                      {SOCIAL_PLATFORMS.map((platform) => {
                        const linkData = socialLinks?.[platform.id] as
                          | SocialLink
                          | undefined;

                        const isEditing = editingPlatform === platform.id;

                        // Only show in view mode if it has data
                        if (!linkData && !isEditing) return null;

                        return (
                          <div
                            key={platform.id}
                            className={cn(
                              "group transition-all",
                              isEditing
                                ? "flex flex-col gap-3 w-full animate-in fade-in slide-in-from-top-2"
                                : "relative",
                            )}
                          >
                            {isEditing ? (
                              <div className="flex items-center gap-4 p-3 rounded-2xl bg-muted/30 border border-primary/10 shadow-sm shadow-primary/5">
                                <div
                                  className={cn(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                                    platform.bg,
                                    platform.color,
                                  )}
                                >
                                  <platform.icon className="h-5 w-5" />
                                </div>
                                <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">
                                    {platform.label}
                                  </span>
                                  <Input
                                    value={socialValue}
                                    onChange={(e) =>
                                      setSocialValue(e.target.value)
                                    }
                                    placeholder="Enter profile URL..."
                                    className="h-8 border-none bg-transparent p-1 text-sm font-medium shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 border-b border-border/80 rounded-none w-full"
                                    autoFocus
                                  />
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/20"
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
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Plus className="h-4.5 w-4.5" />
                                    )}
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
                                    onClick={() => setEditingPlatform(null)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              /* Standard View Mode Pattern (Responsive) */
                              <div className="relative group/item flex items-center gap-3 w-full lg:w-auto">
                                <a
                                  href={linkData?.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={cn(
                                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-lg",
                                    platform.bg,
                                    platform.color,
                                    "hover:shadow-[0_8px_20px_rgba(var(--background),0.3)]",
                                  )}
                                  title={platform.label}
                                >
                                  <platform.icon className="h-5 w-5" />
                                </a>

                                {/* Label: Only visible on WEB or if row layout forced */}
                                <div className="hidden lg:flex flex-col min-w-0">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">
                                    {platform.label}
                                  </span>
                                  <span className="truncate text-[9px] font-medium text-muted-foreground/60">
                                    {linkData?.url.replace(/^https?:\/\//, "")}
                                  </span>
                                </div>

                                {/* Actions: Always visible on mobile, hover on Desktop */}
                                <div className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 transition-all duration-200 lg:opacity-0 lg:group-hover/item:opacity-100 lg:scale-75 lg:group-hover/item:scale-100">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingPlatform(platform.id);
                                      setSocialValue(linkData?.url || "");
                                    }}
                                    className="flex h-5 w-5 items-center justify-center rounded-full bg-background border border-border shadow-sm text-muted-foreground hover:text-primary transition-colors"
                                  >
                                    <Pencil className="h-2.5 w-2.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      linkData && deleteSocial(linkData.id)
                                    }
                                    className="flex h-5 w-5 items-center justify-center rounded-full bg-background border border-border shadow-sm text-muted-foreground hover:text-destructive transition-colors"
                                  >
                                    <Trash2 className="h-2.5 w-2.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Empty State */}
                    {(!socialLinks?.items || socialLinks.items.length === 0) &&
                      !editingPlatform &&
                      !isAddingNewSocial && (
                        <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in-95">
                          <div className="mb-3 rounded-full bg-muted/60 p-3 ring-4 ring-muted/20">
                            <PlusCircle className="h-6 w-6 text-muted-foreground/30" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                            No Social Links
                          </p>
                        </div>
                      )}

                    {/* Add Workflow */}
                    <div className="mt-4 pt-3 border-t border-dashed border-border/60">
                      {isAddingNewSocial ? (
                        <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-primary/20 bg-primary/[0.01] p-3 animate-in fade-in slide-in-from-bottom-2">
                          <Select
                            onValueChange={(val) => {
                              setEditingPlatform(val);
                              setSocialValue("");
                              setIsAddingNewSocial(false);
                            }}
                          >
                            <SelectTrigger className="h-9 border-none bg-background shadow-sm rounded-xl text-xs font-black uppercase tracking-widest ring-1 ring-border/60">
                              <SelectValue placeholder="SELECT PLATFORM" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border/60 shadow-2xl">
                              {SOCIAL_PLATFORMS.filter(
                                (p) =>
                                  !socialLinks?.[p.id as keyof SocialLinks],
                              ).map((p) => (
                                <SelectItem
                                  key={p.id}
                                  value={p.id}
                                  className="text-[10px] font-black uppercase tracking-widest py-2.5 focus:bg-primary/5 focus:text-primary transition-colors"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div
                                      className={cn(
                                        "flex h-6 w-6 items-center justify-center rounded-lg shadow-sm",
                                        p.bg,
                                        p.color,
                                      )}
                                    >
                                      <p.icon className="h-3 w-3" />
                                    </div>
                                    {p.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-foreground transition-colors"
                            onClick={() => setIsAddingNewSocial(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="h-10 w-full gap-2.5 rounded-2xl border-dashed border-border/80 text-[10px] font-black uppercase tracking-widest transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary shadow-sm hover:translate-y-[-1px] group"
                          onClick={() => setIsAddingNewSocial(true)}
                        >
                          <PlusCircle className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          Add Social Link
                        </Button>
                      )}
                    </div>
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
