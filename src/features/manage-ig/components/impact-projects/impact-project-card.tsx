"use client";

import { ExternalLink, Rocket, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ImpactProject } from "../../schemas";

interface ImpactProjectCardProps {
  project: ImpactProject;
  onView: () => void;
}

export function ImpactProjectCard({ project, onView }: ImpactProjectCardProps) {
  const leads = project.team.filter((m) => m.is_lead);

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onView}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView();
        }
      }}
      className="flex-row items-center gap-2.5 sm:gap-3 rounded-2xl border-border/60 bg-muted/20 p-2.5 sm:p-3 shadow-none transition-colors hover:border-border hover:bg-card cursor-pointer"
    >
      <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary">
        {project.image ? (
          // biome-ignore lint/performance/noImgElement: remote media host is backend-controlled, not in next/image allowlist
          <img
            src={project.image}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <Rocket className="h-5 w-5 sm:h-6 sm:w-6" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {project.title}
        </p>
        <p className="mt-0.5 line-clamp-2 break-words text-xs text-muted-foreground">
          {project.description}
        </p>
        <div className="mt-1.5 sm:mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          {leads.length > 0 && (
            <span className="inline-flex min-w-0 items-center gap-1 text-xs font-medium text-muted-foreground">
              <Users className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {leads[0].name}
                {leads.length > 1 && ` +${leads.length - 1}`}
              </span>
            </span>
          )}
          {project.team.length > 0 && (
            <span className="text-xs font-medium text-muted-foreground">
              {project.team.length}{" "}
              {project.team.length === 1 ? "member" : "members"}
            </span>
          )}
          {project.links.slice(0, 2).map((link, i) => (
            <a
              // biome-ignore lint/suspicious/noArrayIndexKey: read-only preview, list never reorders
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </Card>
  );
}
