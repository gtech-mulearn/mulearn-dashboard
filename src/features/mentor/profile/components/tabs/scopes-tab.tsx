/**
 * Scopes Tab
 *
 * 📍 src/features/mentor/profile/components/tabs/scopes-tab.tsx
 *
 * A mentor is one person with an employer identity and a SET of scoped
 * grants — this tab stacks all of them unconditionally:
 *   1. Employer card (identity — unaffected by mentoring scopes)
 *   2. One card per Campus/Company scope held
 *   3. Interest Group scopes (self-service editable)
 */

"use client";

import { Building2, GraduationCap, Layers, Pencil, Target } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MentorApplication } from "@/features/mentor/onboarding/schemas";
import type { MentorOverview, MentorScope } from "@/features/mentor/types";

interface ScopesTabProps {
  mentorProfile: MentorApplication;
  overview: MentorOverview | undefined;
  /** Opens the edit-profile modal (IG self-service editing). */
  onEditIgs?: () => void;
}

function isOrgScope(scope: MentorScope): boolean {
  return (
    scope.scope_type === "COMPANY_MENTOR" ||
    scope.scope_type === "CAMPUS_MENTOR"
  );
}

function isIgScope(scope: MentorScope): boolean {
  return (
    scope.scope_type === "IG_MENTOR" ||
    scope.scope_type === "IG" ||
    scope.scope_type === "Interest Group"
  );
}

export function ScopesTab({
  mentorProfile,
  overview,
  onEditIgs,
}: ScopesTabProps) {
  const orgScopes = overview?.scopes?.filter(isOrgScope) ?? [];
  const igScopes = overview?.scopes?.filter(isIgScope) ?? [];

  return (
    <div className="space-y-4">
      {/* 1. Employer — identity, never touched by scope changes */}
      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Employer
          </CardTitle>
          <CardDescription className="text-xs">
            Your employer — unaffected by mentoring scopes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mentorProfile.company ? (
            <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/40 px-4 py-3">
              <Building2 className="h-5 w-5 shrink-0 text-muted-foreground" />
              <p className="text-sm font-medium">{mentorProfile.company}</p>
            </div>
          ) : (
            <div className="flex min-h-16 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
              No company on record.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Campus / Company scopes */}
      {orgScopes.map((scope) => {
        const isCampus = scope.scope_type === "CAMPUS_MENTOR";
        const Icon = isCampus ? GraduationCap : Building2;
        const label = isCampus ? "Campus" : "Company";
        const name =
          scope.scope_name || mentorProfile.company || mentorProfile.org;
        return (
          <Card
            key={`${scope.scope_type}:${scope.scope_name}`}
            className="rounded-2xl border-border/50"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {label} Scope
              </CardTitle>
              <CardDescription className="text-xs">
                You hold {label.toLowerCase()}-mentor authority for this
                organisation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/40 px-4 py-3">
                <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">
                    {label} Mentor
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* 3. Interest Group scopes — self-service */}
      <Card className="rounded-2xl border-border/50">
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Layers className="h-4 w-4 text-muted-foreground" />
              Interest Group Scopes
            </CardTitle>
            <CardDescription className="text-xs">
              The interest groups you mentor. Changes apply immediately.
            </CardDescription>
          </div>
          {onEditIgs ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={onEditIgs}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit IGs
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {!overview ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : igScopes.length > 0 ? (
            <ul className="space-y-2">
              {igScopes.map((scope) => (
                <li
                  key={scope.scope_name}
                  className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/40 px-4 py-3"
                >
                  <Target className="h-4 w-4 shrink-0 text-primary/60" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {scope.scope_name}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/mentor/sessions"
                    className="shrink-0 text-xs text-primary hover:underline"
                  >
                    View sessions →
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex min-h-20 items-center justify-center rounded-xl border border-dashed px-4 text-center text-sm text-muted-foreground">
              You're not mentoring any Interest Groups yet — add some from Edit
              IGs.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
