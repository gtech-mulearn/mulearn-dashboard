/**
 * Scopes Tab
 *
 * 📍 src/features/mentor/profile/components/tabs/scopes-tab.tsx
 *
 * Shows the interest groups, company, or campus a mentor is scoped to.
 * Uses useTaskIgDropdown() for the mentor's IG scopes.
 * For company/campus mentors the org field from the profile is shown.
 */

"use client";

import { Building2, GraduationCap, Layers, Target } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MentorApplication } from "@/features/mentor/onboarding/schemas";
import { useTaskIgDropdown } from "@/features/mentor/tasks/hooks/use-mentor-tasks";
import type { MentorType } from "../mentor-profile-header";

interface ScopesTabProps {
  mentorProfile: MentorApplication;
  mentorType: MentorType;
}

export function ScopesTab({ mentorProfile, mentorType }: ScopesTabProps) {
  const { data: igList = [], isLoading } = useTaskIgDropdown();

  if (mentorType === "company" || mentorType === "campus") {
    const Icon = mentorType === "company" ? Building2 : GraduationCap;
    const label = mentorType === "company" ? "Company" : "Campus";

    return (
      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {label} Affiliation
          </CardTitle>
          <CardDescription className="text-xs">
            This mentor is scoped to a specific organisation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mentorProfile.org ? (
            <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/40 px-4 py-3">
              <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{mentorProfile.org}</p>
                <p className="text-xs text-muted-foreground">{label} Mentor</p>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[80px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
              No organisation linked yet.
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // IG / Platform mentor: show IG scopes
  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Layers className="h-4 w-4 text-muted-foreground" />
          Interest Group Scopes
        </CardTitle>
        <CardDescription className="text-xs">
          The interest groups this mentor is assigned to.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : igList.length > 0 ? (
          <ul className="space-y-2">
            {igList.map((ig) => (
              <li
                key={ig.id}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/40 px-4 py-3"
              >
                <Target className="h-4 w-4 shrink-0 text-primary/60" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{ig.name}</p>
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
          <div className="flex min-h-[80px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            No interest group scopes found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
