/**
 * Interest Group Detail Client Component
 *
 * 📍 src/features/interest-groups/components/interest-group-detail-client.tsx
 */

"use client";

import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  Clock,
  ExternalLink,
  FileText,
  Linkedin,
  Mail,
  Sparkles,
  Twitter,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useInterestGroupDetail } from "../hooks";

export function InterestGroupDetailClient() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { data, isLoading, error } = useInterestGroupDetail(id || "");
  const group = data?.response?.interestGroup;

  // ── Loading ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] sm:min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            <div className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
            <div className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
            <div className="h-3 w-3 animate-bounce rounded-full bg-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Loading interest group…
          </p>
        </div>
      </div>
    );
  }

  // ── Error / Not found ─────────────────────────────────────
  if (error || !group) {
    const isServerError =
      error &&
      "status" in error &&
      typeof error.status === "number" &&
      error.status >= 500;
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-8 text-center">
          <h3 className="text-lg font-semibold text-destructive">
            {isServerError ? "Server Error" : "Interest Group Not Found"}
          </h3>
          <p className="mt-2 text-sm text-destructive/80">
            {isServerError
              ? "We're experiencing technical difficulties loading this interest group. Please try again later or contact support if the issue persists."
              : "The interest group you're looking for doesn't exist or has been removed."}
          </p>
        </div>
      </div>
    );
  }

  // ── Helpers ───────────────────────────────────────────────
  const hasContent =
    group.about ||
    group.prerequisites?.length ||
    group.career_opportunities?.length ||
    group.top_blogs?.length ||
    group.people_to_follow?.length ||
    group.mentors?.length ||
    group.leads?.length ||
    group.thinktank ||
    group.office_hours ||
    group.resource;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 px-5 py-8 sm:px-6 md:px-8">
      {/* Back */}
      <button
        type="button"
        onClick={() => router.back()}
        className="group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Interest Groups
      </button>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-primary/90 via-primary to-primary/80 p-6 sm:p-8 md:p-12 text-white shadow-xl shadow-primary/10">
        <div className="absolute -right-20 -top-20 h-64 w-64 sm:h-80 sm:w-80 md:h-96 md:w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 sm:h-80 sm:w-80 md:h-96 md:w-96 rounded-full bg-black/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 md:gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4 sm:space-y-6 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              {group.category && (
                <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-md border border-white/10">
                  {group.category}
                </div>
              )}
              {group.code && (
                <div className="inline-flex items-center rounded-full bg-black/20 px-3 py-1 text-xs font-bold font-mono tracking-wider backdrop-blur-md border border-white/10">
                  {group.code}
                </div>
              )}
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight text-white">
                {group.name}
              </h1>
              {group.about && (
                <p className="text-base sm:text-lg leading-relaxed text-white/90 font-medium">
                  {group.about}
                </p>
              )}
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-3 sm:gap-4 pt-2 sm:pt-4">
              {group.members != null && (
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2.5 sm:px-5 sm:py-3 backdrop-blur-md border border-white/10 transition-transform hover:scale-105">
                  <div className="p-1.5 sm:p-2 rounded-full bg-white/20">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-2xl font-bold leading-none">
                      {group.members.toLocaleString()}
                    </p>
                    <p className="text-xs font-medium text-white/70 mt-0.5 sm:mt-1">
                      Members
                    </p>
                  </div>
                </div>
              )}
              {group.status && (
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2.5 sm:px-5 sm:py-3 backdrop-blur-md border border-white/10 transition-transform hover:scale-105">
                  <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/20">
                    <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold leading-none capitalize">
                      {group.status}
                    </p>
                    <p className="text-xs font-medium text-white/70 mt-0.5 sm:mt-1">
                      Current Status
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content grid ── */}
      <div className="grid gap-6 md:gap-8 lg:grid-cols-12 min-w-0">
        {/* Main column */}
        <div className="space-y-6 md:space-y-8 lg:col-span-8 px-2 sm:px-0 min-w-0">
          {/* About Card (only if distinct from header about) */}
          {/* Prerequisites */}
          {group.prerequisites && group.prerequisites.length > 0 && (
            <div className="group rounded-3xl border border-border/50 bg-card p-5 sm:p-8 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
              <div className="mb-4 sm:mb-6 flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Prerequisites
                </h2>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {group.prerequisites.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-transparent hover:border-border transition-colors"
                  >
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                    <span className="text-sm font-medium text-foreground/90 leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Career Opportunities */}
          {group.career_opportunities &&
            group.career_opportunities.length > 0 && (
              <div className="group rounded-3xl border border-border/50 bg-card p-5 sm:p-8 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                <div className="mb-4 sm:mb-6 flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 text-primary">
                    <Briefcase className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Career Opportunities
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {group.career_opportunities.map((opp) => (
                    <span
                      key={opp}
                      className="inline-flex items-center rounded-full bg-background border border-border px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary hover:shadow-md"
                    >
                      {opp}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* Top Blogs */}
          {group.top_blogs && group.top_blogs.length > 0 && (
            <div className="group rounded-3xl border border-border/50 bg-card p-5 sm:p-8 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
              <div className="mb-4 sm:mb-6 flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Top Blogs
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 justify-items-stretch">
                {group.top_blogs.map((blog) => (
                  <a
                    key={blog.url}
                    href={blog.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col justify-between rounded-2xl border border-border/60 bg-muted/20 p-4 sm:p-5 transition-all hover:bg-card hover:border-primary/30 hover:shadow-md group/card"
                  >
                    <span className="text-sm sm:text-base font-semibold text-foreground group-hover/card:text-primary transition-colors line-clamp-2">
                      {blog.title}
                    </span>
                    <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <span>Read Article</span>
                      <ExternalLink className="h-3 w-3 transition-transform group-hover/card:translate-x-1" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* People to Follow */}
          {group.people_to_follow && group.people_to_follow.length > 0 && (
            <div className="group rounded-3xl border border-border/50 bg-card p-5 sm:p-8 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
              <div className="mb-4 sm:mb-6 flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  People to Follow
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {group.people_to_follow.map((person) => (
                  <div
                    key={person.name}
                    className="flex w-full min-w-0 items-start gap-3 sm:gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4 sm:p-5 transition-all hover:border-border hover:bg-card hover:shadow-sm overflow-hidden"
                  >
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-primary/5 text-sm sm:text-lg font-bold text-primary">
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground truncate">
                        {person.name}
                      </p>
                      {person.designation && (
                        <p className="text-sm text-muted-foreground truncate">
                          {person.designation}
                        </p>
                      )}
                      {person.twitter && (
                        <a
                          href={`https://twitter.com/${person.twitter.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline hover:text-primary/80"
                        >
                          <Twitter className="h-3 w-3" />
                          {person.twitter}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mentors */}
          {group.mentors && group.mentors.length > 0 && (
            <div className="group rounded-3xl border border-border/50 bg-card p-5 sm:p-8 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
              <div className="mb-4 sm:mb-6 flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Mentors
                </h2>
              </div>
              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 place-items-stretch">
                {group.mentors.map((mentor) => (
                  <div
                    key={mentor.muid || mentor.name || Math.random()}
                    className="flex w-full max-w-full min-w-0 items-start gap-3 sm:gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4 sm:p-5 transition-all hover:border-border hover:bg-card hover:shadow-sm overflow-hidden"
                  >
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-purple-500/20 to-purple-500/5 text-sm sm:text-lg font-bold text-purple-600">
                      {mentor.name
                        ? mentor.name.charAt(0).toUpperCase()
                        : mentor.muid?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground break-words">
                        {mentor.name || mentor.muid || "Mentor"}
                      </p>
                      {mentor.expertise && (
                        <p className="text-sm text-muted-foreground break-words">
                          {mentor.expertise}
                        </p>
                      )}
                      {mentor.linkedin && (
                        <a
                          href={mentor.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline hover:text-blue-700"
                        >
                          <Linkedin className="h-3 w-3" />
                          LinkedIn Profile
                        </a>
                      )}
                      {mentor.muid && (
                        <p className="text-xs text-muted-foreground mt-1 break-words">
                          MUID: {mentor.muid}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No content fallback */}
          {!hasContent && (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-border/60 bg-muted/10 p-8 sm:p-16 text-center">
              <div className="rounded-full bg-muted p-3 sm:p-4 mb-3 sm:mb-4">
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                No Details Yet
              </h3>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-md">
                This interest group is brand new and hasn't been populated with
                details yet. Check back soon!
              </p>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6 lg:col-span-4 px-2 sm:px-0 min-w-0">
          <div className="space-y-6 lg:sticky lg:top-8">
            {/* Quick Info / Meta */}
            <div className="overflow-hidden rounded-3xl border border-border/50 bg-card shadow-sm">
              <div className="border-b border-border/50 bg-muted/30 px-4 sm:px-6 py-3 sm:py-4">
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  Quick Info
                </h3>
              </div>
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                {/* Office Hours */}
                {group.office_hours && (
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Office Hours
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {group.office_hours}
                      </p>
                    </div>
                  </div>
                )}

                {/* Thinktank */}
                {group.thinktank && (
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <span className="text-sm font-bold">#</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Think Tank
                      </p>
                      <p className="mt-1 text-sm font-mono font-semibold text-foreground">
                        {group.thinktank}
                      </p>
                    </div>
                  </div>
                )}

                {/* Resource Link */}
                {group.resource && (
                  <div className="pt-2">
                    <a
                      href={group.resource}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-95"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Access Resources
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Leads */}
            {group.leads && group.leads.length > 0 && (
              <div className="overflow-hidden rounded-3xl border border-border/50 bg-card shadow-sm">
                <div className="border-b border-border/50 bg-muted/30 px-4 sm:px-6 py-3 sm:py-4">
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    Community Leads
                  </h3>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    {group.leads.map((lead) => (
                      <div
                        key={lead.muid || lead.name || Math.random()}
                        className="mx-0 flex items-start gap-3 rounded-xl border border-transparent p-2 transition-all hover:border-border hover:bg-muted/40 sm:-mx-2"
                      >
                        <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/60 text-xs sm:text-sm font-bold text-white shadow-sm">
                          {lead.name
                            ? lead.name.charAt(0).toUpperCase()
                            : lead.muid?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-foreground break-words whitespace-normal">
                            {lead.name || lead.muid || "Lead"}
                          </p>
                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}`}
                              className="flex w-full items-start gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors break-all"
                            >
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="min-w-0 break-all">
                                {lead.email}
                              </span>
                            </a>
                          )}
                          {lead.muid && (
                            <p className="text-xs text-muted-foreground break-all">
                              MUID: {lead.muid}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Support / Help Box */}
            <div className="rounded-3xl bg-linear-to-br from-muted/50 to-muted/10 p-4 sm:p-6 border border-border/50 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Need help or have questions? Reach out to the leads or join the
                think tank channel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
