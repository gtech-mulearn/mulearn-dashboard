"use client";
import {
  ArrowUpDown,
  ExternalLink,
  MessageCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Project } from "../schemas";

interface ProjectCardProps {
  project: Project;
  canEdit: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function statusVariant(
  status: Project["status"],
): "default" | "secondary" | "outline" {
  if (status === "published") return "default";
  if (status === "draft") return "secondary";
  return "outline";
}

export function ProjectCard({
  project,
  canEdit,
  onOpen,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const upvotes = project.votes.filter((v) => v.vote === "upvote").length;
  const downvotes = project.votes.filter((v) => v.vote === "downvote").length;
  const primaryLink = project.links[0];

  return (
    <div className="group rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-4">
        {project.logo ? (
          <Image
            src={project.logo}
            alt={project.title}
            width={48}
            height={48}
            className="rounded-lg object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-lg bg-muted" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button type="button" onClick={onOpen} className="text-left">
              <h4 className="font-semibold truncate">{project.title}</h4>
            </button>
            {project.status !== "published" && (
              <Badge
                variant={statusVariant(project.status)}
                className="text-xs capitalize"
              >
                {project.status}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        </div>
      </div>

      {project.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {project.skills.slice(0, 4).map((s) => (
            <Badge key={s.id} variant="outline" className="text-xs">
              {s.name}
            </Badge>
          ))}
          {project.skills.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{project.skills.length - 4}
            </Badge>
          )}
        </div>
      )}

      {project.members.length > 0 && (
        <div className="mt-4 flex -space-x-2">
          {project.members.slice(0, 5).map((m) =>
            m.is_linked && m.profile_pic ? (
              <Image
                key={m.id}
                src={m.profile_pic}
                alt={m.full_name}
                width={28}
                height={28}
                className="rounded-full border-2 border-card"
                title={m.full_name}
              />
            ) : (
              <div
                key={m.id}
                title={`${m.full_name}${m.is_linked ? "" : " (external)"}`}
                className="h-7 w-7 rounded-full border-2 border-card bg-muted text-xs flex items-center justify-center"
              >
                {m.full_name.charAt(0)}
              </div>
            ),
          )}
          {project.members.length > 5 && (
            <div className="h-7 w-7 rounded-full border-2 border-card bg-muted text-xs flex items-center justify-center">
              +{project.members.length - 5}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <ArrowUpDown className="h-3 w-3" />
            {upvotes - downvotes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            {project.comments.length}
          </span>
          {primaryLink && (
            <a
              href={primaryLink.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-primary truncate max-w-[10rem]"
            >
              <ExternalLink className="h-3 w-3" />
              {primaryLink.label}
            </a>
          )}
        </div>
        {canEdit && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
            <Button type="button" size="icon" variant="ghost" onClick={onEdit}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
