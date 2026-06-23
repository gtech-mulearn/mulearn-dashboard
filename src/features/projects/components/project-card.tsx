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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getApiResponseError } from "@/hooks/use-get-error";
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

function stripMarkdown(md: string | null | undefined): string {
  if (!md) return "";
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

function generateGradient(seed: string | null | undefined): string {
  const source = seed || "project";
  let hash = 0;
  for (let i = 0; i < source.length; i++) {
    hash = source.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 60%), hsl(${hue2}, 80%, 50%))`;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

// ── Folder silhouette ──────────────────────────────────────────────
// Drawn as a single SVG path so the concave tab→body fillet stays crisp at
// any size. The viewBox is stretched to the card box (preserveAspectRatio
// "none"); HTML content is layered on top, so only the fill stretches.
const FOLDER = {
  w: 320,
  h: 280,
  r: 26, // outer corner radius
  tabTopY: 76, // raised left "tab" top edge
  bodyTopY: 6, // lower right body top edge (orange shows above it)
  tabRightX: 118, // where the tab top ends and the S-curve begins
  curveEndX: 190, // where the S-curve settles onto the body top
} as const;

const FOLDER_PATH = [
  `M ${FOLDER.r},${FOLDER.tabTopY}`,
  `H ${FOLDER.tabRightX}`,
  // smooth S-curve from the tall tab down to the lower body
  `C ${FOLDER.tabRightX + 30},${FOLDER.tabTopY} ${FOLDER.curveEndX - 30},${FOLDER.bodyTopY} ${FOLDER.curveEndX},${FOLDER.bodyTopY}`,
  `H ${FOLDER.w - FOLDER.r}`,
  `Q ${FOLDER.w},${FOLDER.bodyTopY} ${FOLDER.w},${FOLDER.bodyTopY + FOLDER.r}`,
  `V ${FOLDER.h - FOLDER.r}`,
  `Q ${FOLDER.w},${FOLDER.h} ${FOLDER.w - FOLDER.r},${FOLDER.h}`,
  `H ${FOLDER.r}`,
  `Q 0,${FOLDER.h} 0,${FOLDER.h - FOLDER.r}`,
  `V ${FOLDER.tabTopY + FOLDER.r}`,
  `Q 0,${FOLDER.tabTopY} ${FOLDER.r},${FOLDER.tabTopY}`,
  "Z",
].join(" ");

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const time = new Date(dateStr).getTime();
  if (Number.isNaN(time)) return "";
  const diff = Date.now() - time;
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
  // Defensive against partial payloads: the API client validates leniently
  // (returns the raw response on a schema mismatch), so Zod array/string
  // defaults aren't guaranteed at runtime.
  const votes = project.votes ?? [];
  const comments = project.comments ?? [];
  const title = project.title?.trim() || "Untitled project";

  const upvotes = votes.filter((v) => v.vote === "upvote").length;
  const commentCount = comments.length;
  const plainDescription = stripMarkdown(project.description);

  const userVote = currentUserId
    ? votes.find((v) => v.user_id === currentUserId && v.vote === "upvote")
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
      className="group relative aspect-[8/7] w-full select-none overflow-hidden rounded-[26px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a4d] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      style={{
        // Warm coral→orange backdrop, brightest upper-left (shows through the
        // folder's top band). Fixed dark-only treatment, theme-independent.
        background:
          "radial-gradient(115% 130% at 18% -12%, #ffb36b 0%, #ff7a4d 28%, #f0502e 52%, #7a2418 76%, #171717 100%)",
      }}
    >
      {/* Dark folder body */}
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${FOLDER.w} ${FOLDER.h}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path d={FOLDER_PATH} fill="#171717" />
      </svg>

      {/* Content layer */}
      <div className="absolute inset-0 flex flex-col p-5">
        {/* Top band (over the orange): label + actions */}
        <div className="flex items-start justify-between gap-3">
          {resolveMediaUrl(project.logo) ? (
            <Image
              src={resolveMediaUrl(project.logo) as string}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-xl border border-white/15 object-cover"
            />
          ) : (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white shadow-sm"
              style={{ background: generateGradient(title) }}
            >
              {title.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex flex-col items-end gap-2">
            {/* biome-ignore lint/a11y/noStaticElementInteractions: stops click propagation to parent role=button */}
            <div
              className="flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <Button
                variant="secondary"
                size="sm"
                className={`h-7 rounded-full border-0 px-2.5 text-[12px] backdrop-blur-sm ${
                  hasUpvoted
                    ? "bg-white text-[#171717] hover:bg-white/90"
                    : "bg-black/25 text-white hover:bg-black/35"
                }`}
                onClick={handleUpvote}
                disabled={!currentUserId || isPendingVote}
                aria-pressed={hasUpvoted}
                aria-label={hasUpvoted ? "Remove upvote" : "Upvote project"}
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
                      className="h-7 w-7 rounded-full bg-black/25 text-white backdrop-blur-sm hover:bg-black/35 hover:text-white"
                      aria-label="Project options"
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

            {/* Creator + time label (maps to the reference's top-right caption) */}
            <p className="max-w-[9rem] text-right text-[11px] font-medium leading-tight text-white/85">
              {project.created_by?.trim() || "Unknown"}
              {timeAgo(project.created_at) && (
                <>
                  <br />
                  <span className="text-white/60">
                    {timeAgo(project.created_at)}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Title + description — bottom-aligned within the dark body */}
        <div className="mt-auto">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[18px] font-semibold leading-snug tracking-tight text-white line-clamp-1">
              {title}
            </h3>
            {project.status && project.status !== "published" && (
              <Badge className="h-4 shrink-0 border-0 bg-white/15 px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wider text-white/90">
                {project.status}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-white/45 line-clamp-3">
            {plainDescription || "No description provided."}
          </p>
        </div>

        {/* Bottom stats */}
        <div className="mt-4 flex items-end justify-between">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleUpvote();
            }}
            disabled={!currentUserId || isPendingVote}
            aria-pressed={hasUpvoted}
            aria-label={hasUpvoted ? "Remove upvote" : "Upvote project"}
            className="flex items-baseline gap-1.5 rounded-lg text-left transition-opacity hover:opacity-80 disabled:cursor-default disabled:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <span
              className={`text-[22px] font-semibold leading-none ${
                hasUpvoted ? "text-[#ff8a5c]" : "text-white"
              }`}
            >
              {pad2(upvotes)}
            </span>
            <span className="text-[12px] font-medium text-white/50">
              {upvotes === 1 ? "Vote" : "Votes"}
            </span>
          </button>

          <span className="flex items-center gap-1.5 text-[13px] font-medium text-white/55">
            <MessageCircle className="h-3.5 w-3.5" />
            <span className="font-semibold text-white/90">{commentCount}</span>
            {commentCount === 1 ? "Comment" : "Comments"}
            <ArrowUpRight className="h-3.5 w-3.5 text-white/40 opacity-0 transition-opacity group-hover:opacity-100" />
          </span>
        </div>
      </div>
    </div>
  );
}
