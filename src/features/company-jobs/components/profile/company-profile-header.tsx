"use client";

import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Globe,
  Linkedin,
  MapPin,
  Pencil,
  Share2,
  Users,
  CheckCircle,
  Lock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { CompanyProfile } from "../../types";

type RemotePolicy = "Remote" | "Hybrid" | "In-office";

const REMOTE_POLICY_STYLES: Record<RemotePolicy, string> = {
  Remote: "bg-success/20 text-primary-foreground",
  Hybrid: "bg-brand-blue/20 text-primary-foreground",
  "In-office": "bg-background/20 text-primary-foreground",
};

interface CompanyProfileHeaderProps {
  profile: CompanyProfile;
  activeJobsCount: number;
  isOwnProfile: boolean;
  foundedYear?: number | null;
  remotePolicy?: string | null;
}

export function CompanyProfileHeader({
  profile,
  activeJobsCount,
  isOwnProfile,
  foundedYear,
  remotePolicy,
}: CompanyProfileHeaderProps) {
  const isVerified =
    profile.status === "active" || profile.status === "verified";

  // Logo / initials
  const initials = profile.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const memberSinceDate = profile.created_at
    ? new Date(profile.created_at)
    : null;
  const memberSince =
    memberSinceDate && !Number.isNaN(memberSinceDate.getTime())
      ? memberSinceDate.toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        })
      : null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-sm">
      {/* ── Banner ── */}
      <div className="relative h-48 w-full sm:h-56">
        {/* Geometric dark banner matching student profile aesthetic */}
        <div className="absolute inset-0 bg-foreground">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-transparent to-brand-purple/20" />
        </div>

        {/* Gradient overlay for text readability — same as student profile */}
        <div className="absolute inset-0 bg-linear-to-r from-foreground/60 to-foreground/40" />

        {/* Content overlaid on banner */}
        <div className="absolute inset-0 flex items-end p-4 sm:items-center sm:px-6">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            {/* Left: Logo + identity */}
            <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
              {/* Logo */}
              <div className="shrink-0">
                {profile.logo ? (
                  <Image
                    src={profile.logo}
                    alt={profile.name}
                    width={80}
                    height={80}
                    className="h-16 w-16 rounded-xl border-2 border-background/90 bg-card object-contain p-1 shadow-lg sm:h-20 sm:w-20 sm:rounded-2xl"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-background/90 bg-primary shadow-lg sm:h-20 sm:w-20 sm:rounded-2xl">
                    <span className="text-xl font-black text-primary-foreground sm:text-2xl">
                      {initials}
                    </span>
                  </div>
                )}
              </div>

              {/* Name + meta */}
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h1 className="truncate text-xl font-black text-white drop-shadow-lg sm:text-2xl md:text-3xl">
                    {profile.name}
                  </h1>
                  {isVerified && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/30 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm sm:text-xs">
                      <CheckCircle2 className="size-3" />
                      Verified
                    </span>
                  )}
                </div>

                {/* Meta chips */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {profile.industry_sector && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-white/75 sm:text-xs">
                      <Building2 className="size-3 shrink-0" />
                      {profile.industry_sector}
                    </span>
                  )}
                  {profile.company_size && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-white/75 sm:text-xs">
                      <Users className="size-3 shrink-0" />
                      {profile.company_size}
                    </span>
                  )}
                  {profile.location && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-white/75 sm:text-xs">
                      <MapPin className="size-3 shrink-0" />
                      {profile.location}
                    </span>
                  )}
                  {foundedYear && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-white/75 sm:text-xs">
                      <CalendarDays className="size-3 shrink-0" />
                      Est. {foundedYear}
                    </span>
                  )}
                  {remotePolicy && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm sm:text-xs ${REMOTE_POLICY_STYLES[remotePolicy as RemotePolicy] ?? "bg-white/20 text-white"}`}
                    >
                      {remotePolicy}
                    </span>
                  )}
                  {memberSince && (
                    <span className="text-[11px] text-white/50 sm:text-xs">
                      Member since {memberSince}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
              {/* External links */}
              {profile.website_link && (
                <a
                  href={profile.website_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-8 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
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
                  className="flex size-8 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                  title="LinkedIn"
                >
                  <Linkedin className="size-3.5" />
                </a>
              )}

              {isOwnProfile ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    aria-label="Edit Profile"
                    className="gap-1 rounded-full sm:gap-1.5 sm:text-sm"
                  >
                    <Link href="/dashboard/company/profile/edit">
                      <Pencil className="size-3.5" />
                      <span className="hidden sm:inline">Edit Profile</span>
                    </Link>
                  </Button>
                  {isVerified ? (
                    <Button
                      aria-label="Post a Job"
                      size="sm"
                      asChild
                      variant="default"
                      className="gap-1 rounded-full text-xs sm:gap-1.5 sm:text-sm bg-background px-3 text-foreground hover:bg-background/90 border-none"
                    >
                      <Link href="/dashboard/company/jobs/create">
                        Post a Job
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      aria-label="Post a Job (Locked)"
                      size="sm"
                      disabled
                      title="Available after company verification"
                      variant="default"
                      className="gap-1 rounded-full text-xs sm:gap-1.5 sm:text-sm bg-background px-3 text-foreground/50 border-none disabled:opacity-100 disabled:pointer-events-auto cursor-not-allowed"
                    >
                      <Lock className="size-3.5 mr-0.5" />
                      Post a Job
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    aria-label="Share"
                    variant="outline"
                    size="sm"
                    className="gap-1 rounded-full  text-xs sm:gap-1.5 sm:text-sm"
                  >
                    <Share2 className="size-3.5" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                  <Button
                    variant="default"
                    aria-label={`View Open Roles${activeJobsCount > 0 ? `, ${activeJobsCount} jobs` : ""}`}
                    size="sm"
                    className="gap-1 rounded-full bg-background px-3 text-xs text-foreground hover:bg-background/90 sm:gap-1.5 sm:text-sm border-none"
                    onClick={() => {
                      document
                        .getElementById("company-jobs-section")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    View Open Roles
                    {activeJobsCount > 0 && (
                      <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-success text-[9px] font-bold text-white">
                        {activeJobsCount}
                      </span>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
