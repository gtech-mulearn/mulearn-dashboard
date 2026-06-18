"use client";

import {
  ArrowUpDown,
  Crown,
  ExternalLink,
  Eye,
  Loader2,
  ScrollText,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Pagination from "@/components/dashboard/table/pagination";
import Table from "@/components/dashboard/table/Table";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SectionErrorFallback } from "@/components/ui/errors/SectionErrorFallback";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type TMinuteItem,
  useGuilds,
  useInternOverview,
  useManageMinutes,
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

function trimMinutesText(text: string) {
  if (!text) return "";
  if (text.startsWith("http://") || text.startsWith("https://")) {
    try {
      const url = new URL(text);
      const displayUrl =
        url.hostname + (url.pathname !== "/" ? url.pathname : "");
      if (displayUrl.length > 50) {
        return `${displayUrl.substring(0, 47)}...`;
      }
      return displayUrl;
    } catch {
      if (text.length > 50) {
        return `${text.substring(0, 47)}...`;
      }
      return text;
    }
  }
  return text;
}

export function ManageMinutesPageClient() {
  const { hasRole } = usePermissions();
  const isAdmin = hasRole([ROLES.ADMIN, ROLES.ASSOCIATE]);

  const { data: overview } = useInternOverview();
  const isInternLead =
    overview?.role === "INTERN_LEAD" || overview?.role === "Intern Lead";
  const internGuild = overview?.guild;

  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [guildFilter, setGuildFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewingMinute, setViewingMinute] = useState<TMinuteItem | null>(null);

  const renderContentWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex).map((part, i) => ({
      key: `${part}-${i}`,
      text: part,
      isUrl: !!part.match(urlRegex),
    }));
    return parts.map((item) => {
      if (item.isUrl) {
        return (
          <a
            key={item.key}
            href={item.text}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-500 hover:underline inline-flex items-center gap-1 font-bold break-all"
          >
            {item.text} <ExternalLink className="w-3 h-3 inline shrink-0" />
          </a>
        );
      }
      return item.text;
    });
  };

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

  const columnOrder = useMemo(() => {
    const cols = [
      { column: "date", Label: "Date", isSortable: false, width: "w-44" },
      {
        column: "title",
        Label: "Title",
        isSortable: false,
        width: "min-w-[50px] max-w-[80px]",
      },
    ];
    if (isAdmin) {
      cols.push({
        column: "guild",
        Label: "Guild",
        isSortable: false,
        width: "w-50",
      });
    }
    cols.push(
      {
        column: "uploaded_by_name",
        Label: "Uploaded By",
        isSortable: false,
        width: "min-w-[150px]",
      },
      {
        column: "minutes",
        Label: "Minutes Details",
        isSortable: false,
        width: "min-w-[250px]",
      },
    );
    return cols;
  }, [isAdmin]);

  const tableRows = useMemo(() => {
    return minutes.map((item) => ({
      ...item,
      full_name: item.title, // Map to full_name for mobile card header
    })) as unknown as import("@/components/dashboard/table/Table").Data[];
  }, [minutes]);

  const customCellRender = useCallback(
    (
      column: string,
      row: import("@/components/dashboard/table/Table").Data,
    ) => {
      const item = row as unknown as TMinuteItem;
      switch (column) {
        case "date":
          return (
            <div className="flex items-center justify-start gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
                <ScrollText className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-foreground uppercase tracking-tight">
                  {new Date(item.date).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mt-1 block">
                  Year {new Date(item.date).getFullYear()}
                </span>
              </div>
            </div>
          );
        case "title":
          return (
            <span
              className="font-bold text-foreground uppercase tracking-tight text-sm truncate max-w-[120px]"
              title={item.title}
            >
              {item.title}
            </span>
          );
        case "guild":
          return (
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground font-bold uppercase tracking-wider">
              {item.guild}
            </div>
          );
        case "uploaded_by_name":
          return (
            <div className="flex flex-col">
              <span className="font-bold text-foreground uppercase tracking-tight text-sm truncate max-w-[150px]">
                {item.uploaded_by_name || item.created_by_name || "Unknown"}
              </span>
              {item.uploaded_by_muid && (
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mt-1">
                  {item.uploaded_by_muid}
                </span>
              )}
            </div>
          );
        case "minutes":
          return (
            <span className="text-xs text-muted-foreground font-medium line-clamp-2">
              {trimMinutesText(item.minutes)}
            </span>
          );
        default:
          return null;
      }
    },
    [],
  );

  const customActionRender = useCallback(
    (row: import("@/components/dashboard/table/Table").Data) => {
      const item = row as unknown as TMinuteItem;
      return (
        <div className="flex items-center justify-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setViewingMinute(item)}
            className="size-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      );
    },
    [],
  );

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
            {internGuild}
          </Badge>
        )}
      </div>

      {/* Minutes Table */}
      <ErrorBoundary FallbackComponent={SectionErrorFallback}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black uppercase tracking-widest">
                Minutes Log
              </h3>
              <p className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-wider mt-0.5">
                {totalCount} entries found
              </p>
            </div>
            {/* Inline filters */}
            <div className="flex flex-wrap items-center gap-2">
              {isAdmin && (
                <Select
                  value={guildFilter}
                  onValueChange={(v) => {
                    setGuildFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[160px] h-8 font-black uppercase text-[10px] tracking-widest border-border/40 bg-card/40">
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
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
                }
                className="gap-2 h-8 font-black uppercase text-[10px] tracking-widest border-border/40"
              >
                <ArrowUpDown className="w-3 h-3" />
                {sortOrder === "desc" ? "Newest" : "Oldest"}
              </Button>
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
            <Table
              rows={tableRows}
              isLoading={isLoading}
              page={page}
              perPage={perPage}
              columnOrder={columnOrder}
              id={["id"]}
              slNoCellClassName="font-black text-muted-foreground/40"
              customCellRender={customCellRender}
              customActionRender={customActionRender}
            >
              <THead
                columnOrder={columnOrder}
                onIconClick={() => {}}
                action
                thClassName="bg-muted/20 border-b border-border/20 h-12 font-black uppercase text-[9px] tracking-[0.3em]"
              />
              <div>
                {totalPages > 1 && (
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
                )}
              </div>
              <div />
            </Table>
          )}
        </div>
      </ErrorBoundary>

      {/* View Details Dialog */}
      <Dialog
        open={viewingMinute !== null}
        onOpenChange={(open) => {
          if (!open) setViewingMinute(null);
        }}
      >
        <DialogContent className="bg-card/95 backdrop-blur-xl border-border/60 w-full max-w-[calc(100%-2rem)] sm:max-w-xl p-4 sm:p-6">
          <DialogHeader>
            <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground mb-1.5 font-bold uppercase tracking-wider">
              <span>
                {viewingMinute &&
                  new Date(viewingMinute.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
              </span>
              <span>•</span>
              <Badge
                variant="outline"
                className="font-bold border-amber-500/30 text-amber-500 bg-amber-500/5 text-[10px]"
              >
                {viewingMinute?.guild}
              </Badge>
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight text-foreground">
              {viewingMinute?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium mt-1">
              Uploaded by{" "}
              {viewingMinute?.uploaded_by_name ||
                viewingMinute?.created_by_name ||
                "Unknown"}{" "}
              {viewingMinute?.uploaded_by_muid &&
                `(${viewingMinute.uploaded_by_muid})`}{" "}
              on{" "}
              {viewingMinute &&
                new Date(viewingMinute.created_at).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Minutes Details
            </h4>
            <div className="max-h-[350px] overflow-y-auto whitespace-pre-wrap font-medium text-sm leading-relaxed text-muted-foreground bg-muted/20 p-4 rounded-xl border border-border/40">
              {viewingMinute && renderContentWithLinks(viewingMinute.minutes)}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
