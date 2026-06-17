"use client";

import {
  Calendar,
  Clock,
  Crown,
  ExternalLink,
  FileText,
  Link2,
  Loader2,
  Pencil,
  ScrollText,
  Upload,
} from "lucide-react";
import { useState } from "react";
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
import { SectionErrorFallback } from "@/components/ui/errors/SectionErrorFallback";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useInternOverview,
  useMyMinutes,
  useSubmitMinute,
  useUpdateMinute,
  type TMinuteItem,
} from "@/features/intern";

function getTodayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function InternMinutesPage() {
  const { data: overview } = useInternOverview();
  const isInternLead =
    overview?.role === "INTERN_LEAD" || overview?.role === "Intern Lead";

  const [date, setDate] = useState(getTodayDateString());
  const [link, setLink] = useState("");
  const [text, setText] = useState("");
  const [editingMinute, setEditingMinute] = useState<TMinuteItem | null>(null);

  const submitMutation = useSubmitMinute();
  const updateMutation = useUpdateMinute(editingMinute?.id || "");

  const { data: minutesData, isLoading: isMinutesLoading } = useMyMinutes({
    page: 1,
    perPage: 20,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!link.trim()) return;

    if (editingMinute) {
      updateMutation.mutate(
        { date, link: link.trim(), text: text.trim() || undefined },
        {
          onSuccess: () => {
            setLink("");
            setText("");
            setDate(getTodayDateString());
            setEditingMinute(null);
          },
        },
      );
    } else {
      submitMutation.mutate(
        { date, link: link.trim(), text: text.trim() || undefined },
        {
          onSuccess: () => {
            setLink("");
            setText("");
            setDate(getTodayDateString());
          },
        },
      );
    }
  };

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 max-w-5xl mx-auto w-full bg-background/50">
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
            {overview.guild} — Intern Lead
          </Badge>
        )}
      </div>

      {/* Upload Form */}
      <ErrorBoundary FallbackComponent={SectionErrorFallback}>
        <Card className="bg-card/60 backdrop-blur-xl border-border/60 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-black uppercase tracking-widest flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-500" />
              Upload Minutes
            </CardTitle>
            <CardDescription className="text-xs">
              Submit today&apos;s meeting notes link or paste a brief summary.
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

              {/* Link */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                  <Link2 className="w-3 h-3" />
                  Minutes Document Link
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="url"
                  placeholder="https://docs.google.com/..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="h-10 border-border/40 bg-background/50 font-medium"
                  required
                />
              </div>

              {/* Optional text */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                  <FileText className="w-3 h-3" />
                  Notes (Optional)
                </Label>
                <Textarea
                  placeholder="Brief summary or remarks from the meeting..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                  className="border-border/40 bg-background/50 font-medium resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="default"
                  disabled={
                    submitMutation.isPending ||
                    updateMutation.isPending ||
                    !link.trim()
                  }
                  className="flex-1 gap-2 text-[10px] tracking-widest h-10 bg-amber-500 hover:bg-amber-500/90 text-black font-black"
                >
                  {submitMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
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
                    onClick={() => {
                      setEditingMinute(null);
                      setLink("");
                      setText("");
                      setDate(getTodayDateString());
                    }}
                    className="gap-2 text-[10px] tracking-widest h-10"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </ErrorBoundary>

      {/* Previous Minutes Log */}
      <ErrorBoundary FallbackComponent={SectionErrorFallback}>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Previous Minutes
            </h3>
            <p className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-wider mt-1">
              All uploaded minutes for your guild
            </p>
          </div>

          {isMinutesLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : !minutesData?.data?.length ? (
            <Card className="bg-card/40 border-border/40">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
                <ScrollText className="w-12 h-12 text-muted-foreground/30" />
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  No minutes uploaded yet
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Start by uploading the first meeting minutes above.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {minutesData.data.map((item) => (
                <Card
                  key={item.id}
                  className="bg-card/40 border-border/40 hover:bg-card/60 transition-colors group"
                >
                  <CardContent className="flex items-start justify-between gap-4 p-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
                        <ScrollText className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-sm font-black text-foreground">
                            {new Date(item.date).toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        {item.text && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {item.text}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground/60 font-medium mt-1">
                          Uploaded{" "}
                          {new Date(item.created_at).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingMinute(item);
                          setDate(item.date);
                          setLink(item.link);
                          setText(item.text ?? "");
                        }}
                        className="rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                        title="Edit Minutes"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ErrorBoundary>
    </div>
  );
}
