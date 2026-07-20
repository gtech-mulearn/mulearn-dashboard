"use client";
import {
  Calendar,
  ChevronUp,
  ExternalLink,
  MessageCircle,
  Pencil,
  Send,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Textarea } from "@/components/ui/textarea";
import { chipColor } from "@/lib/chip-colors";
import {
  useCommentOnProject,
  useDeleteComment,
  useDeleteVote,
  useProject,
  useVoteProject,
} from "../hooks";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  currentUserId: string | null;
  canEdit?: boolean;
  onEdit?: () => void;
  creatorMuid?: string;
}

function generateGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 60%), hsl(${hue2}, 80%, 50%))`;
}

function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${process.env.NEXT_PUBLIC_DJANGO_API_URL ?? ""}${url}`;
}

function generateHeroBg(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `linear-gradient(160deg, hsl(${hue}, 30%, 91%) 0%, hsl(${hue}, 20%, 96%) 100%)`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function ProjectDetailModal({
  open,
  onOpenChange,
  projectId,
  currentUserId,
  canEdit = false,
  onEdit,
  creatorMuid: creatorMuidProp,
}: Props) {
  const { data: project, isLoading } = useProject(open ? projectId : "");
  const creatorMuid =
    creatorMuidProp ??
    project?.members.find(
      (m) => m.user_id && m.user_id === project.created_by_id,
    )?.muid;
  const vote = useVoteProject(projectId);
  const deleteVote = useDeleteVote(projectId);
  const comment = useCommentOnProject(projectId);
  const deleteComment = useDeleteComment(projectId);
  const [text, setText] = useState("");

  if (!open) return null;

  const userVote = project?.votes.find((v) => v.user_id === currentUserId);
  const upvoteCount =
    project?.votes.filter((v) => v.vote === "upvote").length ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex w-[min(92vw,1400px)] max-w-none sm:max-w-none flex-col gap-0 overflow-hidden rounded-2xl border p-0 bg-background">
        {/* ── Sticky Header ─────────────────────────────────────── */}
        <DialogHeader className="shrink-0 border-b bg-background px-6 py-4 md:px-8">
          <div className="flex items-center gap-4">
            {/* Logo */}
            {resolveMediaUrl(project?.logo) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolveMediaUrl(project?.logo) as string}
                alt=""
                className="h-14 w-14 shrink-0 rounded-xl object-cover border shadow-sm"
              />
            ) : project ? (
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl font-bold text-white shadow-inner"
                style={{ background: generateGradient(project.title) }}
              >
                {project.title.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="h-14 w-14 shrink-0 rounded-xl bg-muted animate-pulse" />
            )}

            {/* Title + meta */}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground leading-tight truncate">
                {project?.title ?? "Loading…"}
              </DialogTitle>
              {project && (
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
                  {project.status !== "published" && (
                    <Badge
                      variant="secondary"
                      className="capitalize px-2 py-0.5 text-[11px]"
                    >
                      {project.status}
                    </Badge>
                  )}
                  <span className="flex items-center gap-1.5 font-medium">
                    <User className="h-3.5 w-3.5" />
                    {project.created_by}
                  </span>
                  <span className="hidden sm:flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(project.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Edit (creator only) + Upvote */}
            <div className="flex items-center gap-2.5 shrink-0">
              {canEdit && onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 rounded-xl gap-1.5 text-[13px] font-semibold hidden sm:flex"
                  onClick={() => {
                    onOpenChange(false);
                    onEdit();
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              )}
              <Button
                variant={userVote?.vote === "upvote" ? "default" : "outline"}
                size="sm"
                className="h-10 rounded-xl px-4 text-[14px] font-semibold"
                disabled={!currentUserId}
                onClick={() => {
                  if (userVote?.vote === "upvote") {
                    deleteVote.mutate(userVote.id);
                  } else {
                    vote.mutate("upvote");
                  }
                }}
              >
                <ChevronUp className="h-4 w-4 stroke-[2.5] shrink-0" />
                <span>Upvote</span>
                {upvoteCount > 0 && (
                  <span className="ml-0.5 opacity-60 font-normal text-[13px]">
                    {upvoteCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* ── Scrollable body ──────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {isLoading || !project ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              {/* Hero banner — always gradient; screenshots appear in their own section */}
              <div
                className="relative w-full overflow-hidden"
                style={{ height: 160 }}
              >
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{ background: generateHeroBg(project.title) }}
                />
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent" />
              </div>

              {/* Two-column layout */}
              <div className="flex flex-col lg:flex-row gap-8 px-6 py-6 md:px-8 md:py-8">
                {/* ─ Left: Main content ────────────────────────── */}
                <div className="flex-1 min-w-0 space-y-10">
                  {/* Screenshots */}
                  {project.images.length > 0 && (
                    <section>
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                        Screenshots
                        <span className="ml-2 font-normal text-muted-foreground/50">
                          ({project.images.length})
                        </span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {project.images.map((img) => (
                          <a
                            key={img.image}
                            href={resolveMediaUrl(img.image) as string}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="group relative aspect-video rounded-xl overflow-hidden border bg-muted shadow-sm block"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={resolveMediaUrl(img.image) as string}
                              alt={`${project.title} screenshot`}
                              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                            />
                          </a>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Description */}
                  <section>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                      About
                    </h3>
                    <div className="rounded-xl border bg-card px-6 py-5">
                      <MarkdownRenderer content={project.description} />
                    </div>
                  </section>

                  {/* Discussion */}
                  <section>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-1.5">
                      <MessageCircle className="h-3.5 w-3.5" />
                      Discussion
                      <span className="font-normal text-muted-foreground/60">
                        ({project.comments.length})
                      </span>
                    </h3>

                    <div className="rounded-xl border bg-muted/20 p-5 space-y-6">
                      {/* Input */}
                      {currentUserId ? (
                        <div className="flex gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                            You
                          </div>
                          <div className="flex-1 flex flex-col gap-2">
                            <Textarea
                              rows={2}
                              value={text}
                              onChange={(e) => setText(e.target.value)}
                              placeholder="What do you think about this project?"
                              className="text-[13px] resize-none rounded-xl bg-background focus:bg-background"
                              onKeyDown={(e) => {
                                if (
                                  e.key === "Enter" &&
                                  !e.shiftKey &&
                                  text.trim()
                                ) {
                                  e.preventDefault();
                                  comment.mutate(text.trim());
                                  setText("");
                                }
                              }}
                            />
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                className="rounded-lg px-4 h-8 text-[12px]"
                                disabled={!text.trim() || comment.isPending}
                                onClick={() => {
                                  if (text.trim()) {
                                    comment.mutate(text.trim());
                                    setText("");
                                  }
                                }}
                              >
                                <Send className="h-3 w-3 mr-1.5" />
                                Post
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-center text-[13px] text-muted-foreground py-2">
                          Sign in to leave a comment.
                        </p>
                      )}

                      {/* Comment list */}
                      {project.comments.length === 0 ? (
                        <p className="text-center text-[13px] text-muted-foreground py-4">
                          No comments yet. Be the first.
                        </p>
                      ) : (
                        <div className="space-y-5 pt-2 border-t border-border/40">
                          {project.comments.map((c) => (
                            <div
                              key={c.id}
                              className="flex items-start gap-3 group/comment"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-[12px] font-bold text-muted-foreground">
                                {(c.user ?? "?").charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-0.5">
                                  <span className="text-[13px] font-semibold text-foreground">
                                    {c.user ?? "Anonymous"}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground">
                                    {timeAgo(c.created_at)}
                                  </span>
                                </div>
                                <p className="text-[13px] leading-relaxed text-foreground/85 whitespace-pre-wrap">
                                  {c.comment}
                                </p>
                              </div>
                              {currentUserId && c.user_id === currentUserId && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 shrink-0 opacity-0 group-hover/comment:opacity-100 transition-opacity"
                                  onClick={() => deleteComment.mutate(c.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                {/* ─ Right sidebar ─────────────────────────────── */}
                <div className="w-full lg:w-[300px] xl:w-[340px] shrink-0 space-y-6">
                  {/* Mobile edit button */}
                  {canEdit && onEdit && (
                    <Button
                      variant="outline"
                      className="w-full h-10 rounded-xl gap-2 text-[13px] font-semibold sm:hidden"
                      onClick={() => {
                        onOpenChange(false);
                        onEdit();
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit project
                    </Button>
                  )}

                  {/* Links */}
                  {project.links.length > 0 && (
                    <section>
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                        Links
                      </h3>
                      <div className="flex flex-col gap-2">
                        {project.links.map((l) => (
                          <a
                            key={l.id}
                            href={l.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-3 rounded-xl border bg-card p-3 text-[13px] font-semibold transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary group"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10">
                              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <span className="truncate">{l.label}</span>
                          </a>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Built With */}
                  {project.skills.length > 0 && (
                    <section>
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                        Built With
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {project.skills.map((s) => (
                          <Badge
                            key={s.id}
                            className={`text-[12px] px-2.5 py-1 shadow-sm ${chipColor(s.name)}`}
                          >
                            {s.name}
                          </Badge>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Makers */}
                  {(project.created_by || project.members.length > 0) && (
                    <section>
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                        Makers
                      </h3>
                      <div className="rounded-xl border bg-card p-4 space-y-3">
                        {/* Creator — always first */}
                        {project.created_by && (
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white border"
                              style={{
                                background: generateGradient(
                                  project.created_by,
                                ),
                              }}
                            >
                              {project.created_by.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              {creatorMuid ? (
                                <a
                                  href={`/dashboard/profile/${creatorMuid}`}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[13px] font-bold leading-tight truncate text-foreground hover:text-primary hover:underline underline-offset-2 block"
                                >
                                  {project.created_by}
                                </a>
                              ) : (
                                <p className="text-[13px] font-bold leading-tight truncate text-foreground">
                                  {project.created_by}
                                </p>
                              )}
                              <p className="text-[11px] text-muted-foreground truncate">
                                Creator
                              </p>
                            </div>
                          </div>
                        )}
                        {/* Team members */}
                        {project.members.map((m) => (
                          <div key={m.id} className="flex items-center gap-3">
                            {m.is_linked && m.profile_pic ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={resolveMediaUrl(m.profile_pic) as string}
                                alt={m.full_name}
                                className="h-9 w-9 shrink-0 rounded-full object-cover border"
                              />
                            ) : (
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-[13px] font-bold text-muted-foreground border">
                                {m.full_name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              {m.is_linked && m.muid ? (
                                <a
                                  href={`/dashboard/profile/${m.muid}`}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[13px] font-bold leading-tight truncate text-foreground hover:text-primary hover:underline underline-offset-2 block"
                                >
                                  {m.full_name}
                                </a>
                              ) : (
                                <p className="text-[13px] font-bold leading-tight truncate text-foreground">
                                  {m.full_name}
                                </p>
                              )}
                              <p className="text-[11px] text-muted-foreground truncate">
                                {m.is_linked ? m.muid : "Contributor"}
                                {m.role ? ` · ${m.role}` : ""}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
