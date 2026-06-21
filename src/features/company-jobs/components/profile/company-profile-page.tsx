"use client";

import {
  Award,
  Building2,
  CalendarDays,
  ChevronRight,
  FileText,
  Globe,
  Linkedin,
  Lock,
  Mail,
  Pencil,
  Users,
} from "lucide-react";
import Link from "next/link";
import Loader from "@/app/loading";
import { useCompanyProfile } from "../../hooks/use-company-profile";
import { useJobs } from "../../hooks/use-jobs";
import { CompanyCultureSection } from "./company-culture-section";
import { CompanyJobsSection } from "./company-jobs-section";
import { CompanyProfileHeader } from "./company-profile-header";
import { CompanyTestimonialsSection } from "./company-testimonials-section";

// ─── Stat card ───────────────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
  color = "text-brand-blue",
  bg = "bg-brand-blue/10",
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color?: string;
  bg?: string;
}) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
        </div>
        <div
          className={`flex size-11 items-center justify-center rounded-xl ${bg}`}
        >
          <span className={color}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────

function CompanyProfileSidebar({
  profile,
}: {
  profile: ReturnType<typeof useCompanyProfile>["profile"] & object;
}) {
  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Quick Actions
        </h3>
        <div className="space-y-1">
          <Link
            href="/dashboard/company/profile/edit"
            className="flex w-full items-center justify-between rounded-xl p-3 text-left transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-brand-blue/10">
                <Pencil className="size-4 text-brand-blue" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {profile.status === "pending" || profile.status === "rejected"
                  ? "Update Registration"
                  : "Edit Profile"}
              </span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
          {profile.status === "verified" ? (
            <Link
              href="/dashboard/company/jobs/create"
              className="flex w-full items-center justify-between rounded-xl p-3 text-left transition-colors hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-success/10">
                  <FileText className="size-4 text-success" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Post a Job
                </span>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          ) : (
            <div
              className="flex w-full items-center justify-between rounded-xl p-3 text-left opacity-60 cursor-not-allowed"
              title="Available after company verification"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                  <Lock className="size-4 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Post a Job
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Company Details */}
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Details
        </h3>
        <div className="space-y-3">
          {profile.industry_sector && (
            <div className="flex items-center gap-3">
              <Building2 className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-sm text-foreground">
                {profile.industry_sector}
              </span>
            </div>
          )}
          {profile.company_size && (
            <div className="flex items-center gap-3">
              <Users className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-sm text-foreground">
                {profile.company_size} employees
              </span>
            </div>
          )}
          {profile.created_at &&
            (() => {
              const d = new Date(profile.created_at);
              return !Number.isNaN(d.getTime()) ? (
                <div className="flex items-center gap-3">
                  <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    Member since{" "}
                    {d.toLocaleDateString("en-IN", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              ) : null;
            })()}
          {profile.email && (
            <div className="flex items-center gap-3">
              <Mail className="size-4 shrink-0 text-muted-foreground" />
              <a
                href={`mailto:${profile.email}`}
                className="truncate text-sm text-primary hover:underline"
              >
                {profile.email}
              </a>
            </div>
          )}
          {profile.website_link && (
            <div className="flex items-center gap-3">
              <Globe className="size-4 shrink-0 text-muted-foreground" />
              <a
                href={profile.website_link}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-sm text-primary hover:underline"
              >
                {profile.website_link.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
          {profile.linkedin_url && (
            <div className="flex items-center gap-3">
              <Linkedin className="size-4 shrink-0 text-muted-foreground" />
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-sm text-primary hover:underline"
              >
                LinkedIn
              </a>
            </div>
          )}
        </div>
      </div>

      {/* muLearn Credibility */}
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          muLearn Stats
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Avg. Hire Karma
              </span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {(profile.avg_karma_of_hires ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Campus Events
              </span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {profile.campus_events_count ?? 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export function CompanyProfilePage() {
  const { profile, isLoading: isLoadingProfile } = useCompanyProfile();
  const { data: jobsData, isLoading: isLoadingJobs } = useJobs({
    pageIndex: 1,
    perPage: 50,
  });

  if (isLoadingProfile) return <Loader />;
  if (!profile) return null;

  const allJobs = jobsData?.jobs ?? [];
  const activeJobs = allJobs.filter((j) => j.status === "Active");

  return (
    <div className="space-y-5">
      {/* Header — full-width banner with content overlaid */}
      <CompanyProfileHeader
        profile={profile}
        activeJobsCount={activeJobs.length}
        isOwnProfile
        foundedYear={profile.founded_year ?? null}
        remotePolicy={profile.remote_policy ?? null}
      />

      {/* Two-column layout */}
      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        {/* Sidebar */}
        <aside className="order-2 lg:order-1">
          <CompanyProfileSidebar profile={profile as object & typeof profile} />
        </aside>

        {/* Main content */}
        <div className="order-1 space-y-5 lg:order-2">
          {/* Stats row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              icon={<FileText className="size-5" />}
              value={activeJobs.length}
              label="Open Roles"
              color="text-success"
              bg="bg-success/10"
            />
            <StatCard
              icon={<Award className="size-5" />}
              value={(profile.avg_karma_of_hires ?? 0).toLocaleString()}
              label="Avg. Hire Karma"
              color="text-brand-purple"
              bg="bg-brand-purple/10"
            />
          </div>

          {/* About */}
          {profile.description && (
            <div className="rounded-2xl bg-card p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                About {profile.name}
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                {profile.description}
              </p>
            </div>
          )}

          {/* Culture & Stack */}
          <CompanyCultureSection
            cultureText={profile.culture_text ?? null}
            techStack={profile.tech_stack ?? []}
            perks={profile.perks ?? []}
          />
        </div>
      </div>

      {/* Full-width sections below the two-column layout */}
      {/* Jobs */}
      <CompanyJobsSection
        isOwnProfile
        ownJobs={isLoadingJobs ? [] : allJobs}
        isVerified={profile.status === "verified"}
      />

      {/* Testimonials */}
      <CompanyTestimonialsSection testimonials={profile.testimonials ?? []} />
    </div>
  );
}
