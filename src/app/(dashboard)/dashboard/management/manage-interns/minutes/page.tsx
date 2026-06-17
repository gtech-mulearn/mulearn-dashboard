"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  Crown,
  ExternalLink,
  Filter,
  Loader2,
  ScrollText,
} from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import Pagination from "@/components/dashboard/table/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionErrorFallback } from "@/components/ui/errors/SectionErrorFallback";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useInternOverview,
  useManageMinutes,
  useGuilds,
} from "@/features/intern";
import { usePermissions } from "@/hooks/use-permissions";
import { ROLES } from "@/lib/auth/roles";

const DEFAULT_GUILDS = [
  "DESIGN",
  "FRONTEND",
  "BACKEND",
  "MOBILE",
  "DEVOPS",
  "QA",
  "PM",
];

export default function ManageMinutesPage() {
  const { hasRole } = usePermissions();
  const isAdmin = hasRole([ROLES.ADMIN, ROLES.ASSOCIATE]);

  const { data: overview } = useInternOverview();
  const isInternLead = overview?.role === "INTERN_LEAD";
  const internGuild = overview?.guild;

  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [guildFilter, setGuildFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data: guildsData = [] } = useGuilds();
  const guildOptions = useMemo(
    () => (guildsData.length > 0 ? guildsData : DEFAULT_GUILDS),
    [guildsData],
  );

  // Intern Leads are locked to their own guild
  const effectiveGuildFilter =
    isInternLead && !isAdmin ? (internGuild ?? "all") : guildFilter;

  const { data: minutesData, isLoading } = useManageMinutes({
    page,
    perPage,
    guild: effectiveGuildFilter === "all" ? undefined : effectiveGuildFilter,
    sortOrder,
  });

  const minutes = minutesData?.data ?? [];
  const totalPages = minutesData?.pagination?.totalPages ?? 1;
  const totalCount = minutesData?.pagination?.count ?? 0;

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full bg-background/50">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground uppercase flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <ScrollText className="w-8 h-8 text-amber-500" />
            </div>
            Guild Minutes
          </h2>
          <p className="text-muted-foreground mt-1 font-medium italic text-sm">
            {isAdmin
              ? "View meeting minutes uploaded by all Intern Leads across guilds."
              : `Viewing minutes for ${internGuild ?? "your"} guild.`}
          </p>
        </div>

        {isInternLead && !isAdmin && internGuild && (
          <Badge
            variant="outline"
            className="gap-1.5 px-4 py-2 text-sm font-bold text-amber-500 border-amber-500/30 bg-amber-500/5"
          >
            <Crown className="w-4 h-4" />
            {internGuild} — Intern Lead
          </Badge>
        )}
      </div>

      {/* Filters */}
      <ErrorBoundary FallbackComponent={SectionErrorFallback}>
        <Card className="bg-card/40 border-border/40 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters & Sorting
            </CardTitle>
            <CardDescription className="text-xs">
              {isAdmin
                ? "Filter by guild and sort by date."
                : "Sort minutes by date."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3 pt-0">
            {/* Guild filter — only for admins */}
            {isAdmin && (
              <Select
                value={guildFilter}
                onValueChange={(v) => {
                  setGuildFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[200px] h-10 font-black uppercase text-[10px] tracking-widest border-border/40 bg-card/40">
                  <SelectValue placeholder="Filter by Guild" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-xl border-border/60">
                  <SelectItem
                    value="all"
                    className="font-bold uppercase text-[10px]"
                  >
                    All Guilds
                  </SelectItem>
                  {guildOptions.map((g) => (
                    <SelectItem
                      key={g}
                      value={g}
                      className="font-bold uppercase text-[10px]"
                    >
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Sort order */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
              }
              className="gap-2 h-10 font-black uppercase text-[10px] tracking-widest border-border/40"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              Date: {sortOrder === "desc" ? "Newest First" : "Oldest First"}
            </Button>
          </CardContent>
        </Card>
      </ErrorBoundary>

      {/* Minutes Table */}
      <ErrorBoundary FallbackComponent={SectionErrorFallback}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black uppercase tracking-widest">
                Minutes Log
              </h3>
              <p className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-wider mt-0.5">
                {totalCount} entries found
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : !minutes.length ? (
            <Card className="bg-card/40 border-border/40">
              <CardContent className="flex flex-col items-center justify-center py-20 gap-3">
                <ScrollText className="w-14 h-14 text-muted-foreground/20" />
                <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">
                  No minutes found
                </p>
                <p className="text-xs text-muted-foreground/60">
                  No minutes have been uploaded for the selected filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Table header */}
              <div className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3 bg-muted/20 border-b border-border/20">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                    Date
                  </span>
                  {isAdmin && (
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                      Guild
                    </span>
                  )}
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                    Uploaded By
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                    Notes
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground text-center">
                    Link
                  </span>
                </div>

                <div className="divide-y divide-border/20">
                  {minutes.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3.5 items-center hover:bg-muted/10 transition-colors"
                    >
                      {/* Date */}
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
                          <ScrollText className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-foreground">
                            {new Date(item.date).toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60">
                            Uploaded{" "}
                            {new Date(item.created_at).toLocaleDateString(
                              undefined,
                              { month: "short", day: "numeric" },
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Guild (admin only) */}
                      {isAdmin && (
                        <Badge
                          variant="outline"
                          className="font-bold uppercase tracking-wider text-xs"
                        >
                          {item.guild}
                        </Badge>
                      )}

                      {/* Uploaded by */}
                      <div className="text-right">
                        <p className="text-xs font-bold text-foreground">
                          {item.uploaded_by_name}
                        </p>
                        {item.uploaded_by_muid && (
                          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                            {item.uploaded_by_muid}
                          </p>
                        )}
                      </div>

                      {/* Notes */}
                      <div className="max-w-[180px] text-right">
                        {item.text ? (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {item.text}
                          </p>
                        ) : (
                          <span className="text-xs text-muted-foreground/40 italic">
                            —
                          </span>
                        )}
                      </div>

                      {/* Link */}
                      <div className="flex justify-center">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                            title="Open Minutes"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-border/20">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    perPage={perPage}
                    totalCount={totalCount}
                    handlePreviousClick={() =>
                      setPage((p) => Math.max(1, p - 1))
                    }
                    handleNextClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </ErrorBoundary>
    </div>
  );
}
