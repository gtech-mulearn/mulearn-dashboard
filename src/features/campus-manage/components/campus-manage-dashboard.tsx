"use client";

import { format, isSameDay } from "date-fns";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  CalendarDays,
  Download,
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
  MoreHorizontal,
  MoreVertical,
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
import { useRouter } from "next/navigation";
import { type ReactNode, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { endpoints } from "@/api/endpoints";
import {
  AXIS_PROPS,
  ChartGradients,
  ChartTooltip,
  GRID_PROPS,
  MAX_BAR_SIZE,
  seriesColor,
  seriesGradient,
} from "@/components/charts/chart-theme";
import Pagination from "@/components/dashboard/table/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { StatCard } from "@/components/ui/stat-card";
import { Switch } from "@/components/ui/switch";
import Table from "@/components/dashboard/table/Table";
import THead from "@/components/dashboard/table/Thead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiResponseError } from "@/hooks/use-get-error";
import { chipColor } from "@/lib/chip-colors";
import { cn } from "@/lib/utils";
import {
  useAddExecomMember,
  useCampusEvents,
  useCampusLeaderboard,
  useCampusOverview,
  useChangeStudentType,
  useDeleteSocialLink,
  useDownloadStudentCsv,
  useEventDistribution,
  useExecomMembers,
  useIgChapters,
  useKarmaByCluster,
  useRemoveExecomMember,
  useUpsertSocialLink,
} from "../hooks";
import type {
  CampusEventFilters,
  CampusLeaderboardFilters,
  CampusLeaderboardItem,
  IgChapter,
  SocialLink,
  SocialLinks,
} from "../types";
import { IgChapterEditDialog } from "./ig-chapter-edit-dialog";
import { IgChapterFormDialog } from "./ig-chapter-form-dialog";
import { StudentLevelsCard } from "./student-levels-card";
import { TransferEnablerDialog } from "./transfer-enabler-dialog";
import { TransferLeadDialog } from "./transfer-lead-dialog";

const PAGE_SIZE = 10;
const CORE_CAMPUS_ROLES = [
  { label: "Campus Lead", value: "Campus Lead" },
  { label: "Lead Enabler", value: "Lead Enabler" },
  { label: "Enabler", value: "Enabler" },
  { label: "Tech Lead", value: "Tech Lead" },
  { label: "Design Lead", value: "Design Lead" },
  { label: "Campus Tech Team", value: "Campus Tech Team" },
  { label: "Campus Design Team", value: "Campus Design Team" },
] as const;

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
    color: "text-brand-blue",
    bg: "bg-brand-blue/10",
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
    color: "text-brand-blue",
    bg: "bg-brand-blue/10",
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: Youtube,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  {
    id: "discord",
    label: "Discord",
    icon: MessageSquare,
    color: "text-brand-purple",
    bg: "bg-brand-purple/10",
  },
  {
    id: "github",
    label: "GitHub",
    icon: Github,
    color: "text-foreground",
    bg: "bg-muted",
  },
  {
    id: "website",
    label: "Website",
    icon: Globe,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    id: "other",
    label: "Other",
    icon: Link2,
    color: "text-warning",
    bg: "bg-warning/10",
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

const normalizeSocialUrl = (platformId: string, input: string): string => {
  const value = input.trim();
  if (!value) return "";

  // If it already looks like a URL (starts with http:// or https://)
  // return it unchanged to avoid double-wrapping like https://github.com/https://github.com/...
  if (/^(f|ht)tps?:\/\//i.test(value)) {
    return value;
  }

  // Treat domain-like inputs without a scheme as URLs
  if (
    /^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+(?:\/|$)/.test(value) &&
    !value.startsWith("@")
  ) {
    return `https://${value}`;
  }

  // Generate URL based on platform rules
  switch (platformId) {
    case "instagram":
      return `https://instagram.com/${value.replace(/^@/, "")}`;
    case "linkedin":
      if (value.startsWith("in/")) {
        return `https://linkedin.com/${value}`;
      }
      if (value.startsWith("company/")) {
        return `https://linkedin.com/${value}`;
      }
      return `https://linkedin.com/in/${value}`;
    case "twitter":
      return `https://twitter.com/${value.replace(/^@/, "")}`;
    case "facebook":
      return `https://facebook.com/${value}`;
    case "youtube":
      return `https://youtube.com/${value.startsWith("@") ? value : `@${value}`}`;
    case "discord":
      if (value.includes("discord.gg") || value.includes("discord.com")) {
        return value;
      }
      return `https://discord.gg/${value}`;
    case "github":
      return `https://github.com/${value}`;
    default:
      return value;
  }
};

/** Derives a clean, human-readable display label from a full social URL. */
const getSocialDisplayLabel = (platformId: string, url: string): string => {
  if (!url) return "";
  try {
    const u = new URL(url);
    // Strip leading/trailing slashes from the path
    const path = u.pathname.replace(/^\//, "").replace(/\/$/, "");
    switch (platformId) {
      case "instagram":
      case "twitter":
        // Natural handle format: @username
        return `@${path}`;
      case "youtube":
        // YouTube channels use @handle
        return path.startsWith("@") ? path : `@${path}`;
      case "linkedin":
        // Strip the "in/" or "company/" prefix → show just the slug
        return path.replace(/^(in|company)\//, "");
      case "github":
        // Just the org/username, no leading slash
        return path;
      case "facebook":
        // Just the page name
        return path;
      case "discord":
        return path ? `discord.gg/${path}` : u.hostname;
      default:
        // For websites: show hostname + path (without trailing slash)
        return u.hostname + (path ? `/${path}` : "");
    }
  } catch {
    // If URL parsing fails, return as-is
    return url;
  }
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
        className="h-9 w-full min-w-[140px] appearance-none rounded-full border border-border/60 bg-background pl-4 pr-10 text-[11px] font-semibold uppercase tracking-wider text-foreground transition-all hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
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

function CompactStatCard({
  title,
  value,
  icon,
  accentVar,
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
  accentVar: string;
}) {
  return (
    <Card className="h-full border-border/60 transition-all duration-200 hover:scale-[1.02] hover:shadow-md cursor-default">
      <CardContent className="flex h-full flex-col justify-between p-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {title}
          </span>
          <span style={{ color: accentVar, opacity: 0.7 }}>{icon}</span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

const LEADERBOARD_COLUMNS = [
  {
    column: "rank",
    Label: "Rank",
    isSortable: false,
    width: "w-24 text-center",
  },
  { column: "name", Label: "Student", isSortable: false },
  { column: "karma", Label: "Karma", isSortable: false },
  { column: "level", Label: "Level", isSortable: false },
  { column: "cluster", Label: "Department / Cluster", isSortable: false },
  { column: "alumni", Label: "Alumni Status", isSortable: false },
];

export function CampusManageDashboard() {
  const router = useRouter();

  // ── Leaderboard state ──
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [leaderboardFilters, setLeaderboardFilters] =
    useState<CampusLeaderboardFilters>({
      page: 1,
      search: "",
      ig: "",
      category: "",
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
  const [selectedExecomUser, setSelectedExecomUser] = useState<{
    muid: string;
    name: string;
    profilePic: string | null;
  } | null>(null);
  const [selectedExecomRole, setSelectedExecomRole] =
    useState<string>("Enabler");

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

  // ─── Mutations ───────────────────────────────────────────────────────────
  const { mutate: upsertSocial, isPending: isUpsertingSocial } =
    useUpsertSocialLink();
  const { mutate: deleteSocial, isPending: isDeletingSocial } =
    useDeleteSocialLink();
  const { mutate: addExecom, isPending: isAdding } = useAddExecomMember();
  const { mutate: removeExecom, isPending: isRemoving } =
    useRemoveExecomMember();
  const { mutate: changeStudentType, isPending: isChangingType } =
    useChangeStudentType();
  const { mutate: downloadCsv, isPending: isDownloadingCsv } =
    useDownloadStudentCsv();

  // ─── Student type change confirmation state ──
  const [pendingStudent, setPendingStudent] =
    useState<CampusLeaderboardItem | null>(null);

  // ─── Chapter editing state ──
  const [editingChapter, setEditingChapter] = useState<IgChapter | null>(null);

  // ─── Social presence state ──
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [socialValue, setSocialValue] = useState("");
  const [isAddingNewSocial, setIsAddingNewSocial] = useState(false);

  // ─── Derived data ────────────────────────────────────────────────────────
  const leaderboard = leaderboardData?.items ?? [];
  const leaderboardPagination = leaderboardData?.pagination;
  const events = eventsData?.items ?? [];

  // Build campus-scoped role list: core roles + IG campus lead per active chapter
  // Custom roles can be typed via the combobox's "Create" option
  const comboboxRoleOptions = useMemo(() => {
    const roles: Array<{ id: string; title: string }> = CORE_CAMPUS_ROLES.map(
      (r) => ({ id: r.value, title: r.label }),
    );

    // Add IG Campus Lead role for each active campus chapter
    for (const ch of chapters) {
      if (ch.code) {
        roles.push({
          id: `${ch.code} CampusLead`,
          title: `${ch.name} IG Lead`,
        });
      }
    }

    return roles;
  }, [chapters]);

  // FIX: extracted from IIFE — computed above return
  const karmaTrend = overview?.trend ?? [];
  const isKarmaTrendEmpty =
    karmaTrend.length === 0 || karmaTrend.every((p) => p.value === 0);

  const totalPages = Math.max(
    1,
    Math.ceil((leaderboardPagination?.count ?? leaderboard.length) / PAGE_SIZE),
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

  const clusterChartHeight = useMemo(
    () => Math.min(Math.max(clusterData.length * 42, 260), 420),
    [clusterData.length],
  );

  const maxClusterKarma = useMemo(
    () => Math.max(...clusterData.map((item) => item.karma), 0),
    [clusterData],
  );

  const clusterAxisMax = useMemo(() => {
    if (maxClusterKarma <= 0) return 100;
    const magnitude = 10 ** Math.floor(Math.log10(maxClusterKarma));
    const step = magnitude / 2;
    return Math.ceil(maxClusterKarma / step) * step;
  }, [maxClusterKarma]);

  // FIX: explicit uniform ticks — prevents skipped axis values
  const clusterAxisTicks = useMemo(() => {
    const step = clusterAxisMax / 5;
    return Array.from({ length: 6 }, (_, i) => Math.round(i * step));
  }, [clusterAxisMax]);

  // FIX: correct empty-state check for socialLinks object shape
  const hasAnySocialLink = useMemo(() => {
    if (!socialLinks) return false;
    return SOCIAL_PLATFORMS.some((platform) => {
      const link = socialLinks[platform.id as keyof SocialLinks] as
        | SocialLink
        | undefined;
      return !!link?.url;
    });
  }, [socialLinks]);

  const normalizeClusterLabel = (label: string) =>
    label
      .replace(/[_-]+/g, " ")
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const formatClusterTick = (label: string) => {
    const normalized = normalizeClusterLabel(label);
    return normalized.length > 14
      ? `${normalized.slice(0, 14)}...`
      : normalized;
  };

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
    const muid = selectedExecomUser?.muid.trim();
    if (!muid) return;

    const existingRole = execom.find(
      (member) => member.muid.toLowerCase() === muid.toLowerCase(),
    );

    if (existingRole) {
      toast.error(
        `${selectedExecomUser?.name || "This user"} already has a role (${existingRole.role}). Remove the current role before assigning a new one.`,
      );
      return;
    }

    // selectedExecomRole is already the exact role title
    // (from combobox option.id or custom-typed text)
    const roleTitle = selectedExecomRole;

    addExecom(
      { muid, roleTitle },
      {
        onSuccess: () => {
          setSelectedExecomUser(null);
          setSelectedExecomRole("Enabler");
        },
      },
    );
  };

  const isAssigningExecomRole = isAdding;

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
                {/* ── Hero Header ── */}
                <div className="relative mb-6 overflow-hidden rounded-2xl border border-border/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-sky-500/10 to-violet-500/20" />
                  <div className="absolute inset-0 backdrop-blur-[2px]" />
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(0deg,transparent,transparent 24px,currentColor 24px,currentColor 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,currentColor 24px,currentColor 25px)",
                    }}
                  />
                  <div className="relative flex flex-col gap-5 px-4 py-6 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                      <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-500 to-sky-600 text-base sm:text-lg font-bold text-primary-foreground shadow-lg">
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
                    <div className="flex flex-col gap-2 text-xs sm:text-sm sm:items-end border-t border-border/10 pt-4 sm:border-0 sm:pt-0">
                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        <span className="opacity-60 text-[10px] uppercase tracking-widest">
                          Lead:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold truncate max-w-[120px] sm:max-w-none">
                            {overview?.campusLead ?? "-"}
                          </span>
                          <TransferLeadDialog
                            trigger={
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-[10px]"
                              >
                                Transfer
                              </Button>
                            }
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        <span className="opacity-60 text-[10px] uppercase tracking-widest">
                          Enabler:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold truncate max-w-[120px] sm:max-w-none">
                            {overview?.enabler ?? "Not assigned"}
                          </span>
                          <TransferEnablerDialog
                            trigger={
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-[10px]"
                              >
                                Transfer
                              </Button>
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                  <div className="sm:col-span-1 md:col-span-2">
                    <StatCard
                      title="Total Karma"
                      value={(overview?.totalKarma ?? 0).toLocaleString()}
                      icon={<Zap className="h-4 w-4" />}
                      accent="chart-3"
                      gradient
                      className="h-full"
                    />
                  </div>
                  <div className="sm:col-span-1 md:col-span-2">
                    <StatCard
                      title="Global Rank"
                      value={overview?.rank ? `#${overview.rank}` : "-"}
                      icon={<Trophy className="h-4 w-4" />}
                      accent="chart-4"
                      gradient
                      className="h-full"
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  <CompactStatCard
                    title="7-Day Karma"
                    value={(overview?.karma7Day ?? 0).toLocaleString()}
                    icon={<Zap className="h-4 w-4" />}
                    accentVar="var(--chart-1)"
                  />
                  <CompactStatCard
                    title="30-Day Karma"
                    value={(overview?.karma30Day ?? 0).toLocaleString()}
                    icon={<Zap className="h-4 w-4" />}
                    accentVar="var(--chart-2)"
                  />
                  <CompactStatCard
                    title="Total Members"
                    value={(overview?.totalMembers ?? 0).toLocaleString()}
                    icon={<Users className="h-4 w-4" />}
                    accentVar="var(--chart-3)"
                  />
                  <CompactStatCard
                    title="Active Members"
                    value={(overview?.activeMembers ?? 0).toLocaleString()}
                    icon={<Users className="h-4 w-4" />}
                    accentVar="var(--chart-4)"
                  />
                  <CompactStatCard
                    title="Active IG Chapters"
                    value={overview?.igChaptersCount ?? 0}
                    icon={<BookOpen className="h-4 w-4" />}
                    accentVar="var(--chart-5)"
                  />
                </div>

                {/* ── Karma Trend Chart ── */}
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
                    {/* FIX: no IIFE — variables extracted above return */}
                    <div className="relative h-56 min-w-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={karmaTrend}
                          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                        >
                          <ChartGradients />
                          <CartesianGrid {...GRID_PROPS} />
                          <XAxis dataKey="label" {...AXIS_PROPS} />
                          <YAxis
                            {...AXIS_PROPS}
                            allowDecimals={false}
                            width={36}
                          />
                          <Tooltip
                            cursor={{
                              stroke: seriesColor(0),
                              strokeWidth: 1,
                              strokeDasharray: "4 4",
                            }}
                            content={<ChartTooltip />}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            name="Karma"
                            stroke={seriesColor(0)}
                            strokeWidth={2}
                            fill={seriesGradient(0)}
                            dot={false}
                            activeDot={{
                              r: 4,
                              fill: seriesColor(0),
                              strokeWidth: 2,
                              stroke: "#fff",
                            }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                      {isKarmaTrendEmpty && (
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
                  value={leaderboardFilters.category}
                  onChange={handleLeaderboardFilterChange("category")}
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
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 rounded-full"
                  disabled={isDownloadingCsv}
                  onClick={() =>
                    downloadCsv(
                      {
                        alumni: leaderboardFilters.alumni,
                        ig: leaderboardFilters.ig || undefined,
                        category: leaderboardFilters.category || undefined,
                      },
                      {
                        onSuccess: () =>
                          toast.success("Student details exported"),
                        onError: (error) =>
                          toast.error(
                            getApiResponseError(error, {
                              fallback: "Failed to export student details",
                            }),
                          ),
                      },
                    )
                  }
                >
                  {isDownloadingCsv ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Export CSV
                </Button>
              </div>
            </div>

            {isLeaderboardLoading ? (
              <Skeleton className="h-[500px] w-full rounded-2xl" />
            ) : leaderboard.length === 0 ? (
              <Card className="overflow-hidden border-border/60 shadow-md">
                <CardContent className="py-12 text-center text-muted-foreground bg-card">
                  <div className="flex flex-col items-center gap-2 opacity-50">
                    <Users className="h-10 w-10" />
                    <p className="text-sm">No students found.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Table
                rows={leaderboard as any}
                isLoading={isLeaderboardLoading}
                page={leaderboardPage}
                perPage={PAGE_SIZE}
                columnOrder={LEADERBOARD_COLUMNS}
                customCellRender={(column, row) => {
                  const student = row as unknown as CampusLeaderboardItem;
                  switch (column) {
                    case "rank":
                      return (
                        <div
                          className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xs font-black shadow-sm transition-all duration-300 ${
                            student.rank === 1
                              ? "bg-chart-4/15 text-chart-4 ring-2 ring-chart-4/25"
                              : student.rank === 2
                                ? "bg-muted text-muted-foreground ring-2 ring-border"
                                : student.rank === 3
                                  ? "bg-warning/15 text-warning ring-2 ring-warning/25"
                                  : "bg-background text-muted-foreground border border-border/50"
                          }`}
                        >
                          #{student.rank}
                        </div>
                      );
                    case "name":
                      return (
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold tracking-tight transition-colors group-hover:text-primary">
                            {student.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            @{student.muid.split("@")[0]}
                          </span>
                        </div>
                      );
                    case "karma":
                      return (
                        <span className="text-lg font-black tracking-tighter text-success">
                          {student.karma.toLocaleString()}
                        </span>
                      );
                    case "level":
                      return (
                        <Badge
                          className={`h-6 px-2.5 font-bold uppercase tracking-wider text-[10px] shadow-sm border-transparent ${
                            student.level?.includes("7")
                              ? "bg-brand-purple text-white hover:bg-brand-purple/90"
                              : student.level?.includes("6")
                                ? "bg-brand-blue text-white hover:bg-brand-blue/90"
                                : student.level?.includes("5")
                                  ? "bg-primary text-primary-foreground hover:bg-primary/90 font-black"
                                  : student.level?.includes("4")
                                    ? "bg-chart-3 text-white hover:bg-chart-3/90 font-black"
                                    : "bg-muted text-muted-foreground hover:bg-muted/90 font-black"
                          }`}
                        >
                          {student.level}
                        </Badge>
                      );
                    case "cluster":
                      return (
                        <span className="max-w-[200px] truncate text-xs text-muted-foreground block">
                          {student.cluster}
                        </span>
                      );
                    case "alumni":
                      return (
                        <Switch
                          checked={student.alumni}
                          disabled={isChangingType}
                          onCheckedChange={() => setPendingStudent(student)}
                        />
                      );
                    default:
                      return null;
                  }
                }}
              >
                <THead
                  columnOrder={LEADERBOARD_COLUMNS}
                  onIconClick={() => {}}
                  action={false}
                />
                <div>
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
                      leaderboardPagination?.count ?? leaderboard.length
                    }
                  />
                </div>
              </Table>
            )}
          </section>

          {/* ── Dashboard Content Area ── */}
          <section className="px-3 py-4 sm:px-4 lg:px-6">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
              {/* Main Column */}
              <div className="min-w-0 flex-1">
                <Tabs defaultValue="analytics" className="w-full">
                  <TabsList className="scrollbar-none mb-6 flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl bg-muted p-1">
                    {[
                      { value: "analytics", label: "Analytics" },
                      { value: "events", label: "Events" },
                      { value: "execom", label: "Execom" },
                      { value: "ig", label: "IG Chapters" },
                    ].map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="relative shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-card/50 data-[state=inactive]:hover:text-foreground"
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* ── Analytics Tab ── */}
                  <TabsContent value="analytics" className="mt-0 min-w-0">
                    <div className="grid gap-4 xl:grid-cols-2">
                      {/* Card 1: Karma by Cluster */}
                      <Card className="min-w-0 overflow-hidden border-border/60 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">
                            Karma by Cluster
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            Cluster-wise karma contribution
                          </p>
                        </CardHeader>
                        <CardContent className="overflow-hidden p-2">
                          {isClusterLoading ? (
                            <Skeleton className="m-4 h-56 w-full rounded-xl" />
                          ) : clusterData.length > 0 ? (
                            <div className="max-h-[420px] w-full overflow-y-auto overflow-x-hidden pr-1">
                              <div
                                className="w-full"
                                style={{ height: clusterChartHeight }}
                              >
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={clusterData}
                                    layout="vertical"
                                    barSize={18}
                                    margin={{
                                      top: 8,
                                      right: 72,
                                      left: 8,
                                      bottom: 4,
                                    }}
                                  >
                                    <ChartGradients />
                                    <CartesianGrid
                                      {...GRID_PROPS}
                                      vertical
                                      horizontal={false}
                                    />
                                    {/* FIX: explicit uniform ticks — no more skipped axis values */}
                                    <XAxis
                                      {...AXIS_PROPS}
                                      type="number"
                                      domain={[0, clusterAxisMax]}
                                      ticks={clusterAxisTicks}
                                    />
                                    <YAxis
                                      {...AXIS_PROPS}
                                      dataKey="cluster"
                                      type="category"
                                      tick={{
                                        ...AXIS_PROPS.tick,
                                        fontWeight: 700,
                                        textAnchor: "start",
                                      }}
                                      width={120}
                                      dx={-116}
                                      tickFormatter={formatClusterTick}
                                    />
                                    <Tooltip
                                      cursor={{ fill: "transparent" }}
                                      content={({ active, payload }) => {
                                        if (!active || !payload?.length)
                                          return null;
                                        const data = payload[0].payload;
                                        return (
                                          <div className="rounded-xl border border-border bg-popover px-3 py-2 text-popover-foreground shadow-lg">
                                            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                              {data.cluster}
                                            </p>
                                            <div className="space-y-1">
                                              <div className="flex items-center justify-between gap-4 text-xs font-semibold">
                                                <span className="text-muted-foreground">
                                                  Karma
                                                </span>
                                                <span className="font-bold text-foreground">
                                                  {Number(
                                                    data.karma,
                                                  ).toLocaleString()}
                                                </span>
                                              </div>
                                              <div className="flex items-center justify-between gap-4 text-xs font-semibold">
                                                <span className="text-muted-foreground">
                                                  Members
                                                </span>
                                                <span className="font-bold text-foreground">
                                                  {Number(
                                                    data.memberCount,
                                                  ).toLocaleString()}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      }}
                                    />
                                    <Bar
                                      dataKey="karma"
                                      name="Karma"
                                      fill={seriesGradient(0)}
                                      radius={[0, 8, 8, 0]}
                                      barSize={18}
                                      maxBarSize={MAX_BAR_SIZE}
                                    >
                                      <LabelList
                                        dataKey="karma"
                                        content={({
                                          x,
                                          y,
                                          width,
                                          height,
                                          value,
                                        }) => {
                                          const xPos =
                                            typeof x === "number"
                                              ? x
                                              : Number(x ?? 0);
                                          const yPos =
                                            typeof y === "number"
                                              ? y
                                              : Number(y ?? 0);
                                          const barWidth =
                                            typeof width === "number"
                                              ? width
                                              : Number(width ?? 0);
                                          const barHeight =
                                            typeof height === "number"
                                              ? height
                                              : Number(height ?? 0);
                                          const numericValue =
                                            typeof value === "number"
                                              ? value
                                              : Number(value ?? 0);
                                          const safeValue = Number.isFinite(
                                            numericValue,
                                          )
                                            ? numericValue
                                            : 0;
                                          if (safeValue === 0) return null;
                                          const text =
                                            safeValue.toLocaleString();
                                          // Always place label to the right of the bar
                                          const textX = xPos + barWidth + 8;
                                          const textY =
                                            yPos + barHeight / 2 + 4;

                                          return (
                                            <text
                                              x={textX}
                                              y={textY}
                                              textAnchor="start"
                                              fill="currentColor"
                                              fontSize={11}
                                              fontWeight={800}
                                            >
                                              {text}
                                            </text>
                                          );
                                        }}
                                      />
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
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

                      {/* Card 2: Events by Tag */}
                      <Card className="min-w-0 border-border/60 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            Events by Tag
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="min-h-[280px] p-0">
                          {isDistributionLoading ? (
                            <Skeleton className="m-6 h-48 w-full rounded-xl" />
                          ) : distribution.length === 0 ? (
                            // FIX: real empty state instead of fake gray slice
                            <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-muted-foreground">
                              <CalendarDays className="h-8 w-8 opacity-20" />
                              <p className="text-xs font-medium">
                                No tags recorded
                              </p>
                            </div>
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
                              <div className="relative h-[180px] w-[180px] shrink-0 sm:h-[200px] sm:w-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={distribution}
                                      dataKey="count"
                                      nameKey="tag"
                                      innerRadius={55}
                                      outerRadius={75}
                                      paddingAngle={4}
                                      className="outline-none"
                                    >
                                      {distribution.map((entry, index) => (
                                        <Cell
                                          key={`cell-${entry.tag}`}
                                          fill={seriesColor(index)}
                                          stroke="var(--card)"
                                          strokeWidth={2}
                                          className="transition-opacity hover:opacity-80"
                                        />
                                      ))}
                                    </Pie>
                                    <Tooltip content={<ChartTooltip />} />
                                  </PieChart>
                                </ResponsiveContainer>
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

                              <div className="flex w-full min-w-0 flex-1 flex-col justify-center gap-3 sm:pl-4 md:pl-8">
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
                                            backgroundColor: seriesColor(index),
                                          }}
                                        />
                                        <span className="max-w-[100px] truncate text-xs font-bold tracking-tight text-foreground/80">
                                          {entry.tag}
                                        </span>
                                      </div>
                                      <span className="ml-4 text-[10px] font-bold text-muted-foreground transition-colors group-hover/item:text-primary/70">
                                        {percentage}% of total
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      <StudentLevelsCard />
                    </div>
                  </TabsContent>

                  {/* ── Events Tab ── */}
                  <TabsContent value="events" className="mt-0 min-w-0">
                    <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
                      <Button
                        onClick={() => router.push("/dashboard/manage-events")}
                        className="w-full rounded-xl sm:w-auto"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Event
                      </Button>
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

                              <div className="mb-5 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth pb-0.5">
                                {event.tags.length > 0 ? (
                                  event.tags.map((tag) => (
                                    <Badge
                                      key={`${event.id}-${tag || "unnamed"}`}
                                      className={cn(
                                        "h-5 shrink-0 px-2 text-[9px] font-bold uppercase tracking-wider",
                                        chipColor(tag),
                                      )}
                                    >
                                      {tag}
                                    </Badge>
                                  ))
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="h-5 shrink-0 px-2 text-[9px] font-bold uppercase tracking-wider"
                                  >
                                    No tags
                                  </Badge>
                                )}
                              </div>

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

                            <div className="flex items-center justify-between border-t border-border/40 bg-muted/5 px-5 py-3.5 mt-auto">
                              <div className="flex items-center gap-2">
                                <Heart
                                  className={cn(
                                    "h-4 w-4",
                                    event.interestCount > 0
                                      ? "fill-destructive text-destructive"
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
                              {/* FIX: ExternalLink button now navigates to event page */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                                onClick={() =>
                                  router.push(`/dashboard/events/${event.id}`)
                                }
                                aria-label={`View ${event.title}`}
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
                    className="mt-0 animate-in fade-in slide-in-from-bottom-2"
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
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(180px,220px)_auto] lg:items-end">
                          <div className="min-w-0">
                            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                              Search User
                            </p>
                            <MuidSearchInput
                              value={
                                selectedExecomUser
                                  ? [selectedExecomUser.muid]
                                  : []
                              }
                              onChange={() => setSelectedExecomUser(null)}
                              onSelectUser={(user) =>
                                setSelectedExecomUser({
                                  muid: user.muid,
                                  name: user.full_name,
                                  profilePic: user.profile_pic ?? null,
                                })
                              }
                              keepOpen
                              selectedUser={selectedExecomUser}
                              onClear={() => setSelectedExecomUser(null)}
                              placeholder="Search by name or MUID"
                              disabled={isAssigningExecomRole}
                              searchOptions={{
                                endpoint: endpoints.campusManage.execomSearch,
                                queryParam: "q",
                              }}
                            />
                          </div>
                          <div>
                            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                              Role
                            </p>
                            <Combobox
                              options={comboboxRoleOptions}
                              value={selectedExecomRole}
                              onValueChange={setSelectedExecomRole}
                              placeholder="Select or type a role..."
                              emptyText="No matching roles."
                              disabled={isAssigningExecomRole}
                              className="h-9 rounded-xl"
                              onCreateNew={(term) => {
                                setSelectedExecomRole(term);
                              }}
                              createNewText="Use custom role"
                            />
                          </div>
                          <Button
                            onClick={handleAddExecom}
                            disabled={
                              isAssigningExecomRole || !selectedExecomUser?.muid
                            }
                            className="h-11 rounded-xl px-6 font-bold shadow-lg shadow-primary/10 transition-all hover:shadow-primary/20 active:scale-[0.98] lg:self-end"
                          >
                            {isAssigningExecomRole ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                            <span className="ml-2">Assign Role</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <SectionTitle
                      title="Current Execom Roster"
                      subtitle="Our campus leadership team for this tenure"
                    />

                    {isExecomLoading ? (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {[1, 2, 3].map((i) => (
                          <Skeleton
                            key={i}
                            className="h-28 w-full rounded-2xl"
                          />
                        ))}
                      </div>
                    ) : execom.length > 0 ? (
                      <div
                        className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${
                          execom.length > 2 ? "lg:grid-cols-3" : ""
                        }`}
                      >
                        {execom.map((member) => (
                          <div
                            key={`${member.roleLinkId}-${member.muid}-${member.role}`}
                            className="group relative flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
                          >
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
                                    className="rounded-lg px-2 py-0 text-[9px] font-black uppercase tracking-widest"
                                  >
                                    {comboboxRoleOptions.find(
                                      (r) => r.id === member.role,
                                    )?.title ||
                                      (member.role === "member"
                                        ? "Execom"
                                        : member.role)}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* FIX: always at reduced opacity so keyboard users can see it */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-3 top-3 h-7 w-7 rounded-full text-muted-foreground/60 hover:bg-destructive/10 hover:text-destructive transition-all opacity-60 focus-visible:opacity-100 group-hover:opacity-100"
                              disabled={isRemoving}
                              onClick={() => removeExecom(member.roleLinkId)}
                              aria-label={`Remove ${member.name}`}
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
                  <TabsContent value="ig" className="mt-0 min-w-0">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {chapters.length} chapter
                        {chapters.length !== 1 ? "s" : ""} active
                      </p>
                      <IgChapterFormDialog
                        trigger={
                          <Button size="sm" className="gap-1.5">
                            <PlusCircle className="h-3.5 w-3.5" />
                            New Chapter
                          </Button>
                        }
                      />
                    </div>
                    {isChaptersLoading ? (
                      <Skeleton className="h-40 w-full" />
                    ) : chapters.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {chapters.map((chapter) => (
                          <Card
                            key={chapter.id}
                            className="flex h-full flex-col border-border/60 transition-all duration-300 hover:border-primary/45 hover:shadow-lg hover:shadow-primary/[0.02]"
                          >
                            <CardHeader className="pb-3 border-b border-border/40">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
                                    <BookOpen className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0 space-y-0.5">
                                    <CardTitle className="truncate text-sm font-bold leading-tight text-foreground">
                                      {chapter.name}
                                    </CardTitle>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                                      {chapter.membersCount}{" "}
                                      {chapter.membersCount === 1
                                        ? "Student"
                                        : "Students"}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 shrink-0 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                                  onClick={() => setEditingChapter(chapter)}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Edit Chapter</span>
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="flex flex-1 flex-col gap-3 pt-4">
                              <div className="flex items-center justify-between gap-2 border-b border-border/30 pb-3 text-xs">
                                <span className="shrink-0 text-muted-foreground font-medium">
                                  Lead
                                </span>
                                <span
                                  className={cn(
                                    "min-w-0 truncate text-right font-bold text-foreground",
                                    chapter.lead === "No Lead Assigned" &&
                                      "text-muted-foreground/50 italic font-medium",
                                  )}
                                >
                                  {chapter.lead}
                                </span>
                              </div>
                              {chapter.description ? (
                                <p
                                  className="text-xs text-muted-foreground line-clamp-2"
                                  title={chapter.description}
                                >
                                  {chapter.description}
                                </p>
                              ) : (
                                <p className="text-xs text-muted-foreground/50 italic">
                                  No description provided
                                </p>
                              )}
                              {chapter.execomMembers.length > 0 && (
                                <div className="mt-auto pt-3 border-t border-border/30">
                                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Execom
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {chapter.execomMembers.map((name) => (
                                      <Badge
                                        key={name}
                                        variant="outline"
                                        className="text-[10px] font-medium"
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

                    {/* Controlled chapter edit dialog */}
                    {editingChapter && (
                      <IgChapterEditDialog
                        chapter={editingChapter}
                        open
                        onOpenChange={(open) => {
                          if (!open) setEditingChapter(null);
                        }}
                        trigger={null}
                      />
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right Column: Social Presence Sidebar */}
              <div className="w-full xl:w-[320px] 2xl:w-[340px] xl:shrink-0">
                <Card className="h-full border-border/60 shadow-sm transition-shadow hover:shadow-md/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Social Presence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 p-4 pt-0">
                    {/* Existing platforms list */}
                    <div className="flex flex-col gap-1">
                      {SOCIAL_PLATFORMS.map((platform) => {
                        const linkData = socialLinks?.[
                          platform.id as keyof SocialLinks
                        ] as SocialLink | undefined;

                        // Show row only if the link exists OR we're currently editing this platform
                        if (!linkData && editingPlatform !== platform.id)
                          return null;

                        const isEditing = editingPlatform === platform.id;
                        const displayLabel = linkData?.url
                          ? getSocialDisplayLabel(platform.id, linkData.url)
                          : "";

                        return (
                          <div
                            key={platform.id}
                            className="group flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 transition-all hover:border-border/60 hover:bg-muted/30"
                          >
                            {/* Platform icon */}
                            <div
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm transition-transform group-hover:scale-105",
                                platform.bg,
                                platform.color,
                              )}
                            >
                              <platform.icon className="h-4 w-4" />
                            </div>

                            {isEditing ? (
                              /* Edit mode: inline input + save/cancel */
                              <div className="flex min-w-0 flex-1 items-center gap-1 animate-in fade-in slide-in-from-right-2">
                                <Input
                                  value={socialValue}
                                  onChange={(e) =>
                                    setSocialValue(e.target.value)
                                  }
                                  placeholder={
                                    platform.id === "website" ||
                                    platform.id === "other"
                                      ? `Full URL (https://...)`
                                      : `Username or full URL`
                                  }
                                  className="h-8 min-w-0 text-[11px] font-medium"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "Enter" &&
                                      socialValue.trim()
                                    ) {
                                      const normalizedUrl = normalizeSocialUrl(
                                        platform.id,
                                        socialValue,
                                      );
                                      upsertSocial(
                                        {
                                          platform: platform.id,
                                          url: normalizedUrl,
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
                                    className="h-7 w-7 text-success hover:bg-success/10"
                                    disabled={
                                      isUpsertingSocial || !socialValue.trim()
                                    }
                                    title="Save"
                                    aria-label="Save"
                                    onClick={() => {
                                      const normalizedUrl = normalizeSocialUrl(
                                        platform.id,
                                        socialValue,
                                      );
                                      upsertSocial(
                                        {
                                          platform: platform.id,
                                          url: normalizedUrl,
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
                                    title="Cancel"
                                    aria-label="Cancel"
                                    onClick={() => setEditingPlatform(null)}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              /* View mode: platform label + display handle + edit/delete */
                              <>
                                <div className="flex min-w-0 flex-1 flex-col">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                    {platform.label}
                                  </span>
                                  <a
                                    href={linkData?.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block truncate text-[11px] font-semibold text-foreground/80 transition-colors hover:text-primary hover:underline"
                                    title={linkData?.url}
                                  >
                                    {displayLabel}
                                  </a>
                                </div>
                                <div className="flex shrink-0 items-center gap-0.5">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-muted-foreground hover:bg-muted hover:text-foreground"
                                    title={`Edit ${platform.label}`}
                                    aria-label={`Edit ${platform.label}`}
                                    onClick={() => {
                                      setEditingPlatform(platform.id);
                                      // Pre-fill with the raw URL so the user can see it
                                      setSocialValue(linkData?.url || "");
                                    }}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                    disabled={isDeletingSocial}
                                    title={`Remove ${platform.label}`}
                                    aria-label={`Remove ${platform.label}`}
                                    onClick={() =>
                                      linkData && deleteSocial(linkData.id)
                                    }
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

                    {/* Empty state */}
                    {!hasAnySocialLink &&
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

                    {/* Add new social link */}
                    {isAddingNewSocial ? (
                      <div className="mt-1 flex flex-col gap-2 rounded-xl border border-dashed border-border/60 bg-muted/10 p-2 animate-in fade-in slide-in-from-bottom-2">
                        <Select
                          onValueChange={(val) => {
                            setEditingPlatform(val);
                            setSocialValue("");
                            setIsAddingNewSocial(false);
                          }}
                        >
                          <SelectTrigger className="h-9 rounded-lg text-xs font-black uppercase tracking-tight">
                            <SelectValue placeholder="Choose a platform" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {SOCIAL_PLATFORMS.filter(
                              (p) =>
                                !(
                                  socialLinks?.[p.id as keyof SocialLinks] as
                                    | SocialLink
                                    | undefined
                                )?.url,
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

      <ConfirmDialog
        open={pendingStudent !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPendingStudent(null);
        }}
        title={
          pendingStudent?.alumni ? "Mark as active student?" : "Mark as alumni?"
        }
        description={
          pendingStudent?.alumni
            ? `This will mark ${pendingStudent?.name ?? "this student"} as an active student of the campus.`
            : `This will mark ${pendingStudent?.name ?? "this student"} as alumni. They will be excluded from active student views.`
        }
        confirmLabel={
          isChangingType
            ? "Updating..."
            : pendingStudent?.alumni
              ? "Yes, mark as active"
              : "Yes, mark as alumni"
        }
        isPending={isChangingType}
        variant="warning"
        onConfirm={() => {
          if (!pendingStudent) return;
          changeStudentType(
            {
              memberId: pendingStudent.id,
              data: { is_alumni: !pendingStudent.alumni },
            },
            {
              onSuccess: () => {
                toast.success(
                  pendingStudent.alumni
                    ? "Marked as active student"
                    : "Marked as alumni",
                );
                setPendingStudent(null);
              },
              onError: (error) => {
                toast.error(
                  getApiResponseError(error, {
                    fallback: "Failed to update student type",
                  }),
                );
                setPendingStudent(null);
              },
            },
          );
        }}
      />
    </div>
  );
}
