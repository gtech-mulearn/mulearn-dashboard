"use client";

import { ExternalLink, Pencil, Rocket, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ImpactProject } from "../../schemas";

interface ImpactProjectViewDialogProps {
  project: ImpactProject | null;
  canManage?: boolean;
  onClose: () => void;
  onEdit?: (project: ImpactProject) => void;
  onDelete?: (project: ImpactProject) => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
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

export function ImpactProjectViewDialog({
  project,
  canManage = false,
  onClose,
  onEdit,
  onDelete,
}: ImpactProjectViewDialogProps) {
  return (
    <Dialog open={!!project} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex w-[min(92vw,900px)] max-w-none sm:max-w-none flex-col gap-0 overflow-hidden rounded-2xl border bg-background p-0">
        {project && (
          <>
            {/* Sticky header */}
            <DialogHeader className="shrink-0 border-b bg-background px-6 py-4 md:px-8">
              <div className="flex items-center">
                <div className="min-w-0 flex-1">
                  <DialogTitle className="truncate text-xl font-bold leading-tight tracking-tight text-foreground">
                    {project.title}
                  </DialogTitle>
                </div>
              </div>
            </DialogHeader>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {/* Hero banner */}
              <div
                className="relative w-full overflow-hidden"
                style={{ height: 200 }}
              >
                {project.image ? (
                  // biome-ignore lint/performance/noImgElement: remote media host is backend-controlled, not in next/image allowlist
                  <img
                    src={project.image}
                    alt={project.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{ background: generateGradient(project.title) }}
                  >
                    <Rocket className="h-10 w-10 text-white/70" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-8 px-6 py-6 md:px-8 md:py-8 lg:flex-row">
                {/* Left: description */}
                <div className="min-w-0 flex-1 space-y-10">
                  <section>
                    <h3 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      About
                    </h3>
                    <div className="rounded-xl border bg-card px-6 py-5">
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/85">
                        {project.description}
                      </p>
                    </div>
                  </section>
                </div>

                {/* Right sidebar */}
                <div className="w-full shrink-0 space-y-6 lg:w-[300px] xl:w-[340px]">
                  {canManage && (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-9 flex-1 gap-1.5 rounded-xl text-[13px] font-semibold"
                        onClick={() => onEdit?.(project)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-9 w-9 shrink-0 rounded-xl text-destructive hover:text-destructive"
                        aria-label="Delete impact project"
                        onClick={() => onDelete?.(project)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}

                  {project.links.length > 0 && (
                    <section>
                      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        Links
                      </h3>
                      <div className="flex flex-col gap-2">
                        {project.links.map((link) => (
                          <a
                            key={link.url}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 rounded-xl border bg-card p-3 text-[13px] font-semibold transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10">
                              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <span className="truncate">{link.label}</span>
                          </a>
                        ))}
                      </div>
                    </section>
                  )}

                  {project.team.length > 0 && (
                    <section>
                      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        Team
                      </h3>
                      <div className="space-y-3 rounded-xl border bg-card p-4">
                        {[...project.team]
                          .sort((a, b) => Number(b.is_lead) - Number(a.is_lead))
                          .map((member) => (
                            <a
                              key={member.muid}
                              href={`/profile/${member.muid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3"
                            >
                              <Avatar className="h-9 w-9 shrink-0 border">
                                <AvatarImage src={member.avatar ?? undefined} />
                                <AvatarFallback className="text-[13px] font-bold">
                                  {getInitials(member.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="block truncate text-[13px] font-bold leading-tight text-foreground hover:text-primary hover:underline underline-offset-2">
                                  {member.name}
                                </p>
                                <p className="truncate text-[11px] text-muted-foreground">
                                  {member.is_lead ? "Lead" : "Contributor"}
                                </p>
                              </div>
                            </a>
                          ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
