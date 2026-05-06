"use client";

/**
 * Company Profile Header
 *
 * 📍 src/features/company-jobs/components/profile/company-profile-header.tsx
 *
 * Full-width header card: dark zinc-900 banner + white identity bar below.
 * Mirrors the CompanyHeroCard design language (bg-zinc-900, indigo accents).
 */

import {
  Building2,
  Calendar,
  CheckCircle2,
  Globe,
  Linkedin,
  MapPin,
  Pencil,
  Share2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { RemotePolicy } from "../../constants/mock-company-profile";
import type { CompanyProfile } from "../../types";

// ─── Sub-components ──────────────────────────────────────────

function CompanyLogo({ logo, name }: { logo?: string | null; name: string }) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={name}
        className="size-16 rounded-2xl border border-border bg-card object-contain p-1 shadow-md sm:size-[72px]"
      />
    );
  }
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-primary shadow-md sm:size-[72px]">
      <span className="text-xl font-black text-primary-foreground">
        {initials}
      </span>
    </div>
  );
}

const REMOTE_POLICY_STYLES: Record<RemotePolicy, string> = {
  Remote: "bg-success/15 text-success",
  Hybrid: "bg-brand-blue/15 text-brand-blue",
  "In-office": "bg-muted text-muted-foreground",
};

function MetaChip({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs text-muted-foreground ${className}`}
    >
      {children}
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────

interface CompanyProfileHeaderProps {
  profile: CompanyProfile;
  activeJobsCount: number;
  isOwnProfile: boolean;
  // Mock fields (replace as backend ships them)
  foundedYear?: number | null;
  remotePolicy?: RemotePolicy;
}

export function CompanyProfileHeader({
  profile,
  activeJobsCount,
  isOwnProfile,
  foundedYear,
  remotePolicy = "Hybrid",
}: CompanyProfileHeaderProps) {
  const isVerified = profile.status === "active";

  const formatMemberSince = (date?: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* ── Banner ── */}
      <div className="relative h-36 bg-foreground sm:h-44">
        {/* Subtle geometric pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.06] text-background"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        {/* Gradient vignette so the bottom bleeds into white smoothly */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card/20 to-transparent" />
      </div>

      {/* ── Identity bar ── */}
      <div className="px-5 pb-5 pt-0 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          {/* Left: Logo + name + meta */}
          <div className="flex gap-4">
            {/* Logo — lifted to overlap the banner */}
            <div className="-mt-9 shrink-0">
              <CompanyLogo logo={profile.logo} name={profile.name} />
            </div>

            {/* Name + tagline + meta row */}
            <div className="min-w-0 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-black text-foreground sm:text-2xl">
                  {profile.name}
                </h1>
                {isVerified && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
                    <CheckCircle2 className="size-3" />
                    Verified
                  </span>
                )}
              </div>

              {profile.description && (
                <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                  {profile.description}
                </p>
              )}

              {/* Meta row */}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                {profile.industry_sector && (
                  <MetaChip>
                    <Building2 className="size-3" />
                    {profile.industry_sector}
                  </MetaChip>
                )}
                {profile.company_size && (
                  <MetaChip>
                    <Users className="size-3" />
                    {profile.company_size}
                  </MetaChip>
                )}
                {profile.location && (
                  <MetaChip>
                    <MapPin className="size-3" />
                    {profile.location}
                  </MetaChip>
                )}
                {foundedYear && (
                  <MetaChip>
                    <Calendar className="size-3" />
                    Est. {foundedYear}
                  </MetaChip>
                )}
                {remotePolicy && (
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${REMOTE_POLICY_STYLES[remotePolicy]}`}
                  >
                    {remotePolicy}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Open roles count + CTAs */}
          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            {activeJobsCount > 0 && (
              <div className="text-right">
                <p className="text-2xl font-black text-success">
                  {activeJobsCount}
                </p>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Open Role{activeJobsCount !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              {/* External links */}
              {profile.website_link && (
                <a
                  href={profile.website_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  title="Website"
                >
                  <Globe className="size-3.5" />
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  title="LinkedIn"
                >
                  <Linkedin className="size-3.5" />
                </a>
              )}

              {/* Role-specific CTAs */}
              {isOwnProfile ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="rounded-full"
                  >
                    <Link href="/dashboard/company/profile/edit">
                      <Pencil className="size-3.5" />
                      Edit Profile
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    asChild
                    className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Link href="/dashboard/company/jobs/create">
                      Post a Job
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full"
                    title="Share"
                  >
                    <Share2 className="size-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full">
                    Follow
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => {
                      const el = document.getElementById(
                        "company-jobs-section",
                      );
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    View Open Roles
                  </Button>
                </>
              )}
            </div>

            {profile.created_at && (
              <p className="text-[11px] text-muted-foreground">
                Member since {formatMemberSince(profile.created_at)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
