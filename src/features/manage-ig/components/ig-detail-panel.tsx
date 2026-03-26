"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { InterestGroup } from "../schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Calendar,
  Clock,
  Link as LinkIcon,
  BookOpen,
  Lightbulb,
  UserCheck,
  Briefcase,
  Pencil,
  X,
  ExternalLink,
} from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  ig: InterestGroup | null;
  onEdit?: (ig: InterestGroup) => void;
};

function parseStringList(
  items: string[] | string | null | undefined,
): string[] {
  if (!items) return [];
  try {
    if (typeof items === "string") {
      if (items.startsWith("[") || items.startsWith("{")) {
        const parsed = JSON.parse(items);
        if (Array.isArray(parsed)) return parsed.map(String);
        return [String(parsed)];
      }
      return items.trim() ? [items] : [];
    }
    if (Array.isArray(items))
      return items.map((i) => (typeof i === "string" ? i : String(i)));
  } catch {
    return [String(items)];
  }
  return [];
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function DetailSection({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 shrink-0" />
        <h4 className="text-xs font-semibold uppercase tracking-wider">
          {label}
        </h4>
      </div>
      <div className="pl-6">{children}</div>
    </div>
  );
}

function TagList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge
          key={item}
          variant="secondary"
          className="rounded-md px-2 py-0.5 text-xs font-normal"
        >
          {item}
        </Badge>
      ))}
    </div>
  );
}

export function IGDetailPanel({ isOpen, onClose, ig, onEdit }: Props) {
  if (!ig) return null;

  const statusColors: Record<string, string> = {
    active: "ig-status-active",
    requested: "ig-status-requested",
    cancelled: "ig-status-cancelled",
    rejected: "ig-status-rejected",
  };

  const categoryColors: Record<string, string> = {
    maker: "ig-cat-maker",
    coder: "ig-cat-coder",
    creative: "ig-cat-creative",
    manager: "ig-cat-manager",
    others: "ig-cat-others",
  };

  const prerequisites = parseStringList(ig.prerequisites);
  const careerOpportunities = parseStringList(ig.career_opportunities);
  const topBlogs = Array.isArray(ig.top_blogs)
    ? ig.top_blogs
        .map((blog) =>
          typeof blog === "string" ? { title: blog, url: blog } : blog,
        )
        .filter((blog): blog is { title: string; url: string } =>
          Boolean(blog?.url),
        )
    : [];
  const peopleToFollow = Array.isArray(ig.people_to_follow)
    ? ig.people_to_follow
        .map((person) =>
          typeof person === "string" ? { name: person } : person,
        )
        .filter(
          (person): person is { name: string; designation?: string | null } =>
            Boolean(person?.name),
        )
    : [];
  const leads = Array.isArray(ig.leads)
    ? ig.leads
        .map((lead) => (typeof lead === "string" ? { name: lead } : lead))
        .filter((lead): lead is { name: string; email?: string | null } =>
          Boolean(lead?.name),
        )
    : [];
  const mentors = Array.isArray(ig.mentors)
    ? ig.mentors
        .map((mentor) =>
          typeof mentor === "string" ? { name: mentor } : mentor,
        )
        .filter(
          (mentor): mentor is { name: string; expertise?: string | null } =>
            Boolean(mentor?.name),
        )
    : [];

  const hasAbout = Boolean(ig.about);
  const hasPrerequisites = prerequisites.length > 0;
  const hasCareerOpportunities = careerOpportunities.length > 0;
  const hasTopBlogs = topBlogs.length > 0;
  const hasPeopleToFollow = peopleToFollow.length > 0;
  const hasLeads = leads.length > 0;
  const hasMentors = mentors.length > 0;
  const hasLinks = Boolean(ig.thinktank || ig.office_hours || ig.resource);
  const hasAnyDetails =
    hasAbout ||
    hasPrerequisites ||
    hasCareerOpportunities ||
    hasTopBlogs ||
    hasPeopleToFollow ||
    hasLeads ||
    hasMentors ||
    hasLinks;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-sm px-6 py-5">
          <SheetHeader className="space-y-0">
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-1 top-1 h-8 w-8"
                aria-label="Close"
              >
                <X className="size-6" />
              </Button>
            </SheetClose>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <SheetTitle className="text-lg break-words">
                  {ig.name}
                </SheetTitle>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {ig.code}
                </p>
              </div>
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(ig)}>
                  <Pencil className="size-3.5 mr-1.5" /> Edit
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[ig.status] || statusColors.cancelled}`}
            >
              {ig.status}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${categoryColors[ig.category] || categoryColors.others}`}
            >
              {ig.category}
            </span>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground sm:ml-auto">
              <Users className="size-3.5" />
              <span className="font-semibold text-foreground tabular-nums">
                {ig.members?.toLocaleString() ?? 0}
              </span>
              <span className="text-xs">members</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {!hasAnyDetails && (
            <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
              No additional details provided for this interest group.
            </div>
          )}
          {/* About */}
          {hasAbout && (
            <DetailSection icon={BookOpen} label="About">
              <p className="text-sm leading-relaxed text-foreground/90">
                {ig.about}
              </p>
            </DetailSection>
          )}

          {/* Prerequisites */}
          {hasPrerequisites && (
            <DetailSection icon={Lightbulb} label="Prerequisites">
              <TagList items={prerequisites} />
            </DetailSection>
          )}

          {/* Career Opportunities */}
          {hasCareerOpportunities && (
            <DetailSection icon={Briefcase} label="Career Opportunities">
              <TagList items={careerOpportunities} />
            </DetailSection>
          )}

          {/* Top Blogs */}
          {hasTopBlogs && (
            <DetailSection icon={BookOpen} label="Top Blogs">
              <div className="space-y-2">
                {topBlogs.map((blog) => (
                  <a
                    key={blog.url}
                    href={blog.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline truncate"
                  >
                    <ExternalLink className="size-3.5 shrink-0" />
                    <span className="truncate">{blog.title}</span>
                  </a>
                ))}
              </div>
            </DetailSection>
          )}

          {/* People to Follow */}
          {hasPeopleToFollow && (
            <DetailSection icon={UserCheck} label="People to Follow">
              <div className="space-y-2">
                {peopleToFollow.map((person) => (
                  <div key={person.name} className="text-sm">
                    <span className="font-medium text-foreground">
                      {person.name}
                    </span>
                    {person.designation && (
                      <span className="text-muted-foreground">
                        {" "}
                        — {person.designation}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </DetailSection>
          )}

          {(hasLeads || hasMentors) && <Separator />}

          {/* Leads & Mentors */}
          {(hasLeads || hasMentors) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hasLeads && (
                <DetailSection icon={UserCheck} label="Leads">
                  <div className="space-y-1.5">
                    {leads.map((lead) => (
                      <div key={lead.name} className="text-sm flex flex-col">
                        <span className="font-medium text-foreground">
                          {lead.name}
                        </span>
                        {lead.email && (
                          <span className="text-muted-foreground text-xs break-all">
                            ({lead.email})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </DetailSection>
              )}
              {hasMentors && (
                <DetailSection icon={Users} label="Mentors">
                  <div className="space-y-1.5">
                    {mentors.map((mentor) => (
                      <div key={mentor.name} className="text-sm">
                        <span className="font-medium text-foreground">
                          {mentor.name}
                        </span>
                        {mentor.expertise && (
                          <span className="text-muted-foreground text-xs ml-1">
                            ({mentor.expertise})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </DetailSection>
              )}
            </div>
          )}

          {/* Links */}
          {hasLinks && (
            <>
              <Separator />
              <div className="space-y-3">
                {ig.resource && (
                  <DetailSection icon={LinkIcon} label="Resources">
                    <a
                      href={ig.resource}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline truncate max-w-full"
                    >
                      <ExternalLink className="size-3.5 shrink-0" />
                      <span className="truncate">{ig.resource}</span>
                    </a>
                  </DetailSection>
                )}
                {ig.thinktank && (
                  <DetailSection icon={Lightbulb} label="Thinktank">
                    <p className="text-sm text-foreground/90">{ig.thinktank}</p>
                  </DetailSection>
                )}
                {ig.office_hours && (
                  <DetailSection icon={Clock} label="Office Hours">
                    <p className="text-sm text-foreground/90">
                      {ig.office_hours}
                    </p>
                  </DetailSection>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Footer Metadata */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="grid grid-cols-1 gap-y-2 gap-x-4 text-xs sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Created by</span>
                <p className="font-medium text-foreground mt-0.5">
                  {ig.created_by || "—"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Created on</span>
                <p className="font-medium text-foreground mt-0.5">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3" />
                    {formatDate(ig.created_at)}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Last updated by</span>
                <p className="font-medium text-foreground mt-0.5">
                  {ig.updated_by || "—"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Last updated on</span>
                <p className="font-medium text-foreground mt-0.5">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3" />
                    {formatDate(ig.updated_at)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
