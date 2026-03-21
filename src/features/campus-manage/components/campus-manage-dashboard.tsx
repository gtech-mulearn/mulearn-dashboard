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
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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
import { Skeleton } from "@/components/ui/skeleton";
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
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-sm font-medium">{title}</span>
          <span>{icon}</span>
        </div>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
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
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[...Array(7)].map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              <>
                {/* Campus identity strip */}
                <div className="mb-4 rounded-xl border border-border/60 bg-muted/40 px-5 py-4">
                  <h3 className="text-lg font-bold leading-tight">
                    {overview?.collegeName ?? "-"}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>
                      Code:{" "}
                      <span className="font-medium text-foreground">
                        {overview?.campusCode ?? "-"}
                      </span>
                    </span>
                    <span>
                      Zone:{" "}
                      <span className="font-medium text-foreground">
                        {overview?.campusZone ?? "-"}
                      </span>
                    </span>
                    <span>
                      Level:{" "}
                      <span className="font-medium text-foreground">
                        {overview?.campusLevel ?? "-"}
                      </span>
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>
                      Campus Lead:{" "}
                      <span className="font-medium text-foreground">
                        {overview?.campusLead ?? "-"}
                      </span>
                    </span>
                    <span>
                      Enabler:{" "}
                      <span className="font-medium text-foreground">
                        {overview?.enabler ?? "Not assigned"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Stat grid */}
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    title="Total Karma"
                    value={overview?.totalKarma ?? 0}
                    icon={<Zap className="h-4 w-4" />}
                  />
                  <StatCard
                    title="Rank"
                    value={overview?.rank ? `#${overview.rank}` : "-"}
                    icon={<Trophy className="h-4 w-4" />}
                  />
                  <StatCard
                    title="7-day Karma"
                    value={overview?.karma7Day ?? 0}
                    icon={<Zap className="h-4 w-4" />}
                  />
                  <StatCard
                    title="30-day Karma"
                    value={overview?.karma30Day ?? 0}
                    icon={<Zap className="h-4 w-4" />}
                  />
                  <StatCard
                    title="Total Members"
                    value={overview?.totalMembers ?? 0}
                    icon={<Users className="h-4 w-4" />}
                  />
                  <StatCard
                    title="Active Members"
                    value={overview?.activeMembers ?? 0}
                    icon={<Users className="h-4 w-4" />}
                  />
                  <StatCard
                    title="Active IGs"
                    value={overview?.igChaptersCount ?? 0}
                    icon={<BookOpen className="h-4 w-4" />}
                  />
                </div>

                {/* Karma trend chart */}
                <div className="mt-6 h-72 min-w-0 rounded-xl border border-border/60 p-4">
                  <p className="mb-3 text-sm font-medium text-muted-foreground">
                    Karma trend
                  </p>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={overview?.trend ?? []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#0f766e"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
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
                        <TableHead>Karma</TableHead>
                        <TableHead>Rank</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>IG</TableHead>
                        <TableHead>Cluster</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeaderboard.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.karma}</TableCell>
                          <TableCell>#{student.rank}</TableCell>
                          <TableCell>{student.level}</TableCell>
                          <TableCell>{student.ig}</TableCell>
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

          {/* ── 3. Analytics: Karma by Cluster + Events by Tag ── */}
          <section>
            <SectionTitle
              title="3. Analytics"
              subtitle="Karma by cluster and events tag distribution"
            />
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Karma by cluster bar chart */}
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">Karma by cluster</CardTitle>
                </CardHeader>
                <CardContent className="h-72 min-w-0">
                  {isClusterLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : clusterData.length === 0 ? (
                    <p className="mt-8 text-center text-sm text-muted-foreground">
                      No cluster data available.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={clusterData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="cluster" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="karma" fill="#0284c7" radius={8} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Events by tag pie chart */}
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">Events by tag</CardTitle>
                </CardHeader>
                <CardContent className="h-72 min-w-0">
                  {isDistributionLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : distribution.length === 0 ? (
                    <p className="mt-8 text-center text-sm text-muted-foreground">
                      No event tag data available.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distribution}
                          dataKey="count"
                          nameKey="tag"
                          outerRadius={90}
                          label
                        >
                          {distribution.map((entry, index) => (
                            <Cell
                              key={`${entry.tag}-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ── 4. Events feed ── */}
          <section>
            <SectionTitle
              title="4. Events"
              subtitle="Filter and review campus events with tags and interest count"
            />

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
                  <Card key={event.id} className="border-border/60">
                    <CardHeader className="space-y-2 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base leading-snug">
                          {event.title}
                        </CardTitle>
                        <Badge
                          variant={
                            event.status === "completed"
                              ? "secondary"
                              : event.status === "ongoing"
                                ? "default"
                                : "outline"
                          }
                          className="shrink-0 capitalize"
                        >
                          {event.status}
                        </Badge>
                      </div>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {event.date
                          ? new Date(event.date).toLocaleDateString()
                          : "Date TBD"}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {event.tags.length > 0 ? (
                          event.tags.map((tag, index) => (
                            <Badge
                              key={`${event.id}-${tag || "tag"}-${index}`}
                              variant="outline"
                            >
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline">No tags</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Interested members:{" "}
                        <span className="font-semibold text-foreground">
                          {event.interestCount}
                        </span>
                      </p>
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
          </section>

          {/* ── 5. Execom Administration Panel ── */}
          <section>
            <SectionTitle
              title="5. Execom Administration"
              subtitle="Manage execom members — add by MUID or remove existing roles"
            />

            {/* Add member */}
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

            {/* Execom member list */}
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
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.igChapter}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">{member.role}</Badge>
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
          </section>

          {/* ── 6. IG Chapter Administration ── */}
          <section>
            <SectionTitle
              title="6. IG Chapters"
              subtitle="Interest Group chapters with leads and member counts"
            />

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
                        <span className="text-muted-foreground">Lead</span>
                        <span className="font-medium">{chapter.lead}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Members</span>
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
          </section>

          {/* ── 7. Social Links Management ── */}
          <section>
            <SectionTitle
              title="7. Social Links"
              subtitle="Campus social media presence"
            />

            <Card className="border-border/60">
              <CardContent className="p-4">
                {isSocialLoading ? (
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-36" />
                    <Skeleton className="h-10 w-36" />
                  </div>
                ) : socialLinks?.instagram || socialLinks?.linkedin ? (
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.instagram && (
                      <a
                        href={socialLinks.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm transition-colors hover:bg-muted"
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
                        className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm transition-colors hover:bg-muted"
                      >
                        <Linkedin className="h-4 w-4 text-blue-600" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No social links configured for this campus yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
