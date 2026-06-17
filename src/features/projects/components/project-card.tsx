"use client";
import {
  ArrowUp,
  ArrowUpRight,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${process.env.NEXT_PUBLIC_DJANGO_API_URL ?? ""}${url}`;
}

import { getApiResponseError } from "@/hooks/use-get-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteVote, useVoteProject } from "../hooks";
import type { Project } from "../schemas";

interface ProjectCardProps {
  project: Project;
  canEdit: boolean;
  currentUserId?: string | null;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function stripMarkdown(md: string): string {
  return md
    .replace(/<[^>]*>/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^\s*>\s+/gm, "")
    .replace(/---+/g, "")
    .replace(/\n{2,}/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
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

export function ProjectCard({
  project,
  canEdit,
  currentUserId,
  onOpen,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const upvotes = project.votes.filter((v) => v.vote === "upvote").length;
  const commentCount = project.comments.length;
  const plainDescription = stripMarkdown(project.description);

  const userVote = currentUserId
    ? project.votes.find(
        (v) => v.user_id === currentUserId && v.vote === "upvote",
      )
    : undefined;
  const hasUpvoted = !!userVote;

  const vote = useVoteProject(project.id);
  const removeVote = useDeleteVote(project.id);
  const isPendingVote = vote.isPending || removeVote.isPending;

  const handleUpvote = () => {
    if (isPendingVote) return;
    if (hasUpvoted && userVote) {
      removeVote.mutate(userVote.id, {
        onError: (error) =>
          toast.error(
            getApiResponseError(error, { fallback: "Failed to remove vote" }),
          ),
      });
    } else {
      vote.mutate("upvote", {
        onError: (error) =>
          toast.error(
            getApiResponseError(error, { fallback: "Failed to upvote" }),
          ),
      });
    }
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: nested buttons prevent using <button>
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="group flex flex-col gap-4 rounded-2xl border border-border/50 bg-card p-5 shadow-sm transition-all duration-200 hover:border-border hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer h-full"
    >
      {/* Logo + actions */}
      <div className="flex items-start justify-between gap-3">
        {resolveMediaUrl(project.logo) ? (
          <Image
            src={resolveMediaUrl(project.logo) as string}
            alt=""
            width={48}
            height={48}
            unoptimized
            className="h-12 w-12 rounded-full object-cover border border-border/40 shrink-0"
          />
        ) : (
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ background: generateGradient(project.title) }}
          >
            {project.title.charAt(0).toUpperCase()}
          </div>
        )}

        {/* biome-ignore lint/a11y/noStaticElementInteractions: stops click propagation to parent role=button */}
        <div
          className="flex items-center gap-1.5 ml-auto"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Button
            variant={hasUpvoted ? "default" : "secondary"}
            size="sm"
            className="rounded-full h-7 px-2.5"
            onClick={handleUpvote}
            disabled={!currentUserId || isPendingVote}
          >
            <ArrowUp className="h-3 w-3" />
            {upvotes}
          </Button>

          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-full"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 rounded-xl">
                <DropdownMenuItem
                  onClick={onEdit}
                  className="rounded-lg cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Creator + time */}
      <p className="text-[12px] font-medium text-muted-foreground -mt-1">
        {project.created_by ?? "Unknown"} · {timeAgo(project.created_at)}
      </p>

      {/* Title + status + description */}
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <h3 className="text-[16px] font-bold tracking-tight text-foreground leading-snug line-clamp-1">
            {project.title}
          </h3>
          {project.status !== "published" && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-4 uppercase tracking-wider font-semibold shrink-0"
            >
              {project.status}
            </Badge>
          )}
        </div>
        <p className="text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
          {plainDescription || "No description provided."}
        </p>
      </div>

      {/* Skill pills */}
      <div className="flex flex-wrap gap-1.5">
        {project.skills.length > 0 ? (
          <>
            {project.skills.slice(0, 3).map((s) => (
              <span
                key={s.id}
                className="rounded-full bg-secondary/60 px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground"
              >
                {s.name}
              </span>
            ))}
            {project.skills.length > 3 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                +{project.skills.length - 3}
              </span>
            )}
          </>
        ) : (
          <span className="text-[12px] italic text-muted-foreground/40">
            No skills listed
          </span>
        )}
      </div>

      {/* Bottom: comments + View CTA */}
      <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-auto">
        <span className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
          <MessageCircle className="h-3.5 w-3.5" />
          {commentCount} {commentCount === 1 ? "comment" : "comments"}
        </span>
        <span className="flex items-center gap-0.5 text-[12px] font-semibold text-primary group-hover:underline underline-offset-2 transition-colors">
          View
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}
