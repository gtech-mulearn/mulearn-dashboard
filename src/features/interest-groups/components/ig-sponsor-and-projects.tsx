"use client";

import { ExternalLink, Handshake, Rocket } from "lucide-react";
import type { IgImpactProject } from "../schemas/interest-groups.schema";

interface IgSponsorChipProps {
  isSponsored?: boolean;
  name?: string | null;
  logo?: string | null;
}

/** "Sponsored by {company}" — shown only while a company sponsors the IG. */
export function IgSponsorChip({ isSponsored, name, logo }: IgSponsorChipProps) {
  if (!isSponsored || !name) return null;
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-card/10 bg-foreground/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
      {logo ? (
        // biome-ignore lint/performance/noImgElement: external logo URL, next/image would require configuring all possible domains
        <img src={logo} alt="" className="h-4 w-4 rounded-sm object-cover" />
      ) : (
        <Handshake className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      Sponsored by {name}
    </span>
  );
}

// Project links are user-entered: render only web URLs.
const isWebUrl = (url: string) => /^https?:\/\//i.test(url.trim());

/** Projects the IG built, with their public links. */
export function IgImpactProjects({
  projects,
}: {
  projects: IgImpactProject[];
}) {
  if (projects.length === 0) return null;
  return (
    <section aria-labelledby="ig-impact-projects" className="space-y-4">
      <h2
        id="ig-impact-projects"
        className="flex items-center gap-2 text-xl font-bold text-foreground sm:text-2xl"
      >
        <Rocket className="h-5 w-5 text-primary" aria-hidden="true" />
        Impact projects
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <li
            key={project.id}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            {project.image && (
              // biome-ignore lint/performance/noImgElement: user-uploaded project image on an arbitrary host
              <img
                src={project.image}
                alt=""
                className="h-36 w-full object-cover"
              />
            )}
            <div className="space-y-2 p-4">
              <h3 className="font-semibold text-foreground">{project.title}</h3>
              {project.description && (
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {project.description}
                </p>
              )}
              {(project.links ?? []).some((l) => isWebUrl(l.url)) && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {(project.links ?? [])
                    .filter((l) => isWebUrl(l.url))
                    .map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        {link.label || "Link"}
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                    ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
