"use client";

import {
  Calendar,
  Crown,
  ExternalLink,
  Eye,
  FileText,
  Pencil,
  ScrollText,
  Search,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SectionErrorFallback } from "@/components/ui/errors/SectionErrorFallback";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  type TMinuteItem,
  useInternOverview,
  useMyMinutes,
  useSubmitMinute,
  useUpdateMinute,
} from "@/features/intern";
import { usePermissions } from "@/hooks/use-permissions";
import { ROLES } from "@/lib/auth/roles";

function getTodayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

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

export default function InternMinutesPage() {
  const { data: overview } = useInternOverview();
  const { hasRole } = usePermissions();
  const isInternLead =
    overview?.role === "INTERN_LEAD" ||
    overview?.role === "Intern Lead" ||
    hasRole([ROLES.INTERN_LEAD, ROLES.ADMIN]);

  const [date, setDate] = useState(getTodayDateString());
  const [title, setTitle] = useState("");
  const [minutesText, setMinutesText] = useState("");
  const [editingMinute, setEditingMinute] = useState<TMinuteItem | null>(null);
  const [userSelectedTab, setUserSelectedTab] = useState<string | null>(null);
  const activeTab = userSelectedTab || (isInternLead ? "upload" : "history");
  const setActiveTab = setUserSelectedTab;
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingMinute, setViewingMinute] = useState<TMinuteItem | null>(null);

  const submitMutation = useSubmitMinute();
  const updateMutation = useUpdateMinute(editingMinute?.id || "");

  const { data: minutesData, isLoading: isMinutesLoading } = useMyMinutes(
    {
      page: 1,
      perPage: 100, // retrieve more for search/history list
      guild: overview?.guild || undefined,
    },
    !!overview,
  );

  const filteredMinutes = useMemo(() => {
    let list = minutesData?.data ?? [];

    // Filter to only show minutes uploaded for the user's guild
    if (overview?.guild) {
      list = list.filter(
        (item) => item.guild?.toLowerCase() === overview.guild.toLowerCase(),
      );
    }

    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.minutes.toLowerCase().includes(query),
    );
  }, [minutesData, overview?.guild, searchQuery]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !minutesText.trim()) return;

    const payload = {
      guild: overview?.guild || "Frontend Guild",
      date,
      title: title.trim(),
      minutes: minutesText.trim(),
    };

    if (editingMinute) {
      updateMutation.mutate(payload, {
        onSuccess: () => {
          setTitle("");
          setMinutesText("");
          setDate(getTodayDateString());
          setEditingMinute(null);
        },
      });
    } else {
      submitMutation.mutate(payload, {
        onSuccess: () => {
          setTitle("");
          setMinutesText("");
          setDate(getTodayDateString());
        },
      });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground uppercase flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <ScrollText className="w-8 h-8 text-amber-500" />
            </div>
            Guild Minutes
          </h2>
          <p className="text-muted-foreground mt-1 font-medium italic text-sm">
            Upload and track your guild&apos;s daily meeting minutes.
          </p>
        </div>
        {overview?.guild && (
          <Badge
            variant="outline"
            className="gap-1.5 px-4 py-2 text-sm font-bold text-amber-500 border-amber-500/30 bg-amber-500/5"
          >
            <Crown className="w-4 h-4" />
            {overview.guild}
          </Badge>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-6"
      >
        <TabsList className="bg-muted/30 border border-border/40 p-1 rounded-xl w-fit">
          {isInternLead && (
            <TabsTrigger
              value="upload"
              className="font-black uppercase text-xs tracking-wider px-6 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              {editingMinute ? "Edit Minutes" : "Upload Minutes"}
            </TabsTrigger>
          )}
          <TabsTrigger
            value="history"
            className="font-black uppercase text-xs tracking-wider px-6 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Minutes History
          </TabsTrigger>
        </TabsList>

        {isInternLead && (
          <TabsContent value="upload">
            {/* Upload Form */}
            <ErrorBoundary FallbackComponent={SectionErrorFallback}>
              <Card className="bg-card/60 backdrop-blur-xl border-border/60 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-black uppercase tracking-widest flex items-center gap-2">
                    <Upload className="w-4 h-4 text-amber-500" />
                    {editingMinute ? "Edit Minutes" : "Upload Minutes"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {editingMinute
                      ? "Update meeting details or link for this day."
                      : "Submit today's meeting notes link or paste a brief summary."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Date */}
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        Meeting Date
                      </Label>
                      <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="h-10 border-border/40 bg-background/50 font-medium"
                        required
                      />
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                        <FileText className="w-3 h-3" />
                        Meeting Title
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="text"
                        placeholder="e.g. Daily Standup"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-10 border-border/40 bg-background/50 font-medium"
                        required
                      />
                    </div>

                    {/* Minutes Details */}
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                        <ScrollText className="w-3 h-3" />
                        Minutes
                        <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        placeholder="https://notion.com/..."
                        value={minutesText}
                        onChange={(e) => setMinutesText(e.target.value)}
                        rows={6}
                        className="border-border/40 bg-background/50 font-medium resize-none"
                        required
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        variant="default"
                        size="lg"
                        disabled={
                          submitMutation.isPending ||
                          updateMutation.isPending ||
                          !title.trim() ||
                          !minutesText.trim()
                        }
                        className="flex-1 gap-2 text-xs tracking-widest"
                      >
                        {submitMutation.isPending ||
                        updateMutation.isPending ? (
                          <>
                            <Spinner className="w-4 h-4" />
                            Saving...
                          </>
                        ) : editingMinute ? (
                          <>
                            <Upload className="w-4 h-4" />
                            Update Minutes
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload Minutes
                          </>
                        )}
                      </Button>
                      {editingMinute && (
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          onClick={() => {
                            setEditingMinute(null);
                            setTitle("");
                            setMinutesText("");
                            setDate(getTodayDateString());
                          }}
                          className="gap-2 text-xs tracking-widest"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </ErrorBoundary>
          </TabsContent>
        )}

        <TabsContent value="history">
          {/* Previous Minutes Log */}
          <ErrorBoundary FallbackComponent={SectionErrorFallback}>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                  <Input
                    type="text"
                    placeholder="Search minutes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 pl-8 pr-7 text-xs border-border/40 bg-background/50 font-medium placeholder:text-muted-foreground/50 w-full"
                  />
                  {searchQuery && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground text-xs font-bold"
                    >
                      ✕
                    </Button>
                  )}
                </div>
                <div className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-wider">
                  {filteredMinutes.length} entries found
                </div>
              </div>

              {isMinutesLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Spinner className="w-8 h-8 text-muted-foreground" />
                </div>
              ) : !filteredMinutes.length ? (
                <Card className="bg-card/40 border-border/40">
                  <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
                    <ScrollText className="w-12 h-12 text-muted-foreground/30" />
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                      No minutes found
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      Try adjusting your search query or upload some minutes.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2.5">
                  {filteredMinutes.map((item) => (
                    <Card
                      key={item.id}
                      className="bg-card/40 border-border/40 hover:bg-card/60 transition-colors group p-3"
                    >
                      <div className="flex items-center justify-between gap-4 min-w-0">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
                            <ScrollText className="w-3.5 h-3.5 text-amber-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline gap-2">
                              <h4 className="text-xs font-black text-foreground truncate max-w-[200px] sm:max-w-xs uppercase tracking-wider">
                                {item.title}
                              </h4>
                              <span className="text-[9px] text-muted-foreground/60 font-semibold shrink-0 uppercase tracking-widest">
                                •{" "}
                                {new Date(item.date).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5 font-medium leading-none">
                              {trimMinutesText(item.minutes)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => setViewingMinute(item)}
                            className="rounded-lg text-muted-foreground/60 hover:text-foreground h-8 w-8"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {isInternLead && (
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingMinute(item);
                                setDate(item.date);
                                setTitle(item.title);
                                setMinutesText(item.minutes);
                                setActiveTab("upload");
                              }}
                              className="rounded-lg text-muted-foreground/60 hover:text-foreground h-8 w-8"
                              title="Edit Minutes"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </ErrorBoundary>
        </TabsContent>
      </Tabs>

      {/* View Details Dialog */}
      <Dialog
        open={viewingMinute !== null}
        onOpenChange={(open) => {
          if (!open) setViewingMinute(null);
        }}
      >
        <DialogContent className="bg-card/95 backdrop-blur-xl border-border/60 w-full max-w-[calc(100%-2rem)] sm:max-w-xl max-h-[calc(100vh-2rem)] flex flex-col p-4 sm:p-6 rounded-2xl">
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
          <div className="py-4 flex-1 flex flex-col min-h-0">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 shrink-0">
              Minutes Details
            </h4>
            <div className="flex-1 overflow-y-auto min-h-0 whitespace-pre-wrap font-medium text-sm leading-relaxed text-muted-foreground bg-muted/20 p-4 rounded-xl border border-border/40">
              {viewingMinute && renderContentWithLinks(viewingMinute.minutes)}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
