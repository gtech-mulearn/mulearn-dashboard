"use client";

import { ExternalLink, Pencil, Rocket, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ImpactProject } from "../../schemas";

interface ImpactProjectCardProps {
  project: ImpactProject;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function ImpactProjectCard({
  project,
  canManage,
  onEdit,
  onDelete,
}: ImpactProjectCardProps) {
  const lead = project.team.find((m) => m.is_lead);

  return (
    <div className="flex gap-3 rounded-2xl border border-border/60 bg-muted/20 p-3 transition-colors hover:border-border hover:bg-card">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary">
        {project.image ? (
          // biome-ignore lint/performance/noImgElement: remote media host is backend-controlled, not in next/image allowlist
          <img
            src={project.image}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <Rocket className="h-6 w-6" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold text-foreground">
            {project.title}
          </p>
          {canManage && (
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={onEdit}
                aria-label="Edit impact project"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={onDelete}
                aria-label="Delete impact project"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {project.description}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {lead && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Users className="h-3 w-3" />
              {lead.name}
            </span>
          )}
          {project.links.slice(0, 3).map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
