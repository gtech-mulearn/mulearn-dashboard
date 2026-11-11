"use client";

import { BadgeCheck, Handshake, Star, Trophy, Users } from "lucide-react";
import { formatShortDate } from "@/lib/datetime";
import { ImpactReportSchema } from "../../schemas/jobs.schema";

interface CollaborationSummary {
  total_partnerships?: number;
  campus_partnerships?: number;
  ig_partnerships?: number;
}

interface CompanyTrustSignalsProps {
  verifiedSince?: string | null;
  collaborationSummary?: CollaborationSummary | null;
  /** Public impact summary — null unless the company published it. */
  impactSummary?: unknown;
}

const count = (n: number) => n.toLocaleString("en-IN");

/**
 * Public-profile credibility: how long the company has been verified, its
 * accepted partnerships, and (when opted in) its impact summary.
 */
export function CompanyTrustSignals({
  verifiedSince,
  collaborationSummary,
  impactSummary,
}: CompanyTrustSignalsProps) {
  const impact = ImpactReportSchema.safeParse(impactSummary);
  const partnerships = collaborationSummary?.total_partnerships ?? 0;
  const hasVerified = !!verifiedSince && formatShortDate(verifiedSince) !== "—";

  if (!hasVerified && partnerships === 0 && !impact.success) return null;

  return (
    <section
      aria-label="Company credentials"
      className="space-y-4 rounded-xl border border-border bg-card p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        {hasVerified && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Verified since {formatShortDate(verifiedSince)}
          </span>
        )}
        {partnerships > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <Handshake className="h-3.5 w-3.5" aria-hidden="true" />
            {partnerships} {partnerships === 1 ? "partnership" : "partnerships"}
            {" · "}
            {collaborationSummary?.campus_partnerships ?? 0} campus,{" "}
            {collaborationSummary?.ig_partnerships ?? 0} IG
          </span>
        )}
      </div>

      {impact.success && (
        <dl className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-muted/40 p-3">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              Learners reached
            </dt>
            <dd className="mt-1 text-xl font-bold text-foreground">
              {count(impact.data.reach.total_learners_touched)}
            </dd>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5" aria-hidden="true" />
              Average rating
            </dt>
            <dd className="mt-1 text-xl font-bold text-foreground">
              {impact.data.quality_signal.average_rating == null
                ? "—"
                : impact.data.quality_signal.average_rating.toFixed(1)}
            </dd>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
              Hires
            </dt>
            <dd className="mt-1 text-xl font-bold text-foreground">
              {count(impact.data.outcome_signal.hires)}
            </dd>
          </div>
        </dl>
      )}
    </section>
  );
}

interface CompanyProfileCompletenessProps {
  /** 0–100 (CompanyDetailSerializer.profile_completeness). */
  completeness?: number | null;
  /** Set while the registration awaits review. */
  slaMessage?: string | null;
}

/** Owner view: how complete the profile is, and when to expect review. */
export function CompanyProfileCompleteness({
  completeness,
  slaMessage,
}: CompanyProfileCompletenessProps) {
  if (completeness == null && !slaMessage) return null;
  const value = Math.max(0, Math.min(100, Math.round(completeness ?? 0)));

  return (
    <section className="space-y-2 rounded-xl border border-border bg-card p-4">
      {completeness != null && (
        <>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">
              Profile completeness
            </span>
            <span className="text-muted-foreground">{value}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="Profile completeness"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
            className="h-2 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${value}%` }}
            />
          </div>
          {value < 100 && (
            <p className="text-xs text-muted-foreground">
              Complete profiles get more applicants and partnership requests.
            </p>
          )}
        </>
      )}
      {slaMessage && (
        <p className="text-xs font-medium text-warning">{slaMessage}</p>
      )}
    </section>
  );
}
