/**
 * Mentor Profile Sidebar
 *
 * 📍 src/features/mentor/profile/components/mentor-profile-sidebar.tsx
 *
 * - Quick action links: Manage Sessions, Task Requests, Mentees (grayed), Opportunities
 * - Details panel: tier, org/IGs, upcoming session
 */

"use client";

import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MentorSession } from "@/features/home/schemas/home.schema";
import type { MentorApplication } from "@/features/mentor/onboarding/schemas";

interface MentorProfileSidebarProps {
  mentorProfile: MentorApplication;
  upcomingSessions: MentorSession[] | undefined;
  isLoading: boolean;
}

const QUICK_LINKS = [
  {
    href: "/dashboard/mentor/sessions",
    label: "Manage Sessions",
    icon: CalendarDays,
    active: true,
  },
  {
    href: "/dashboard/mentor/task-requests",
    label: "Task Requests",
    icon: BookOpen,
    active: true,
  },
  {
    href: "#",
    label: "Mentees",
    icon: Users,
    active: false,
    badge: "Soon",
  },
  {
    href: "/dashboard/mentor/opportunities",
    label: "Opportunities",
    icon: Sparkles,
    active: true,
  },
];

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MentorProfileSidebar({
  mentorProfile,
  upcomingSessions,
  isLoading,
}: MentorProfileSidebarProps) {
  const nextSession = upcomingSessions?.[0];
  const tier = mentorProfile.mentor_tier;

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <Card className="rounded-2xl border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-2">
          {QUICK_LINKS.map(({ href, label, icon: Icon, active, badge }) => (
            <Link
              key={label}
              href={active ? href : "#"}
              aria-disabled={!active}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "hover:bg-muted" : "pointer-events-none opacity-50"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1">{label}</span>
              {badge ? (
                <Badge variant="secondary" className="text-[10px] font-normal">
                  {badge}
                </Badge>
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              )}
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Details Panel */}
      <Card className="rounded-2xl border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {/* Tier */}
          {tier && (
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">Tier</span>
              <span className="ml-auto font-medium capitalize">{tier}</span>
            </div>
          )}

          {/* Verification Status */}
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 shrink-0 rounded-full ${
                mentorProfile.status === "APPROVED"
                  ? "bg-emerald-400"
                  : "bg-amber-400"
              }`}
            />
            <span className="text-muted-foreground">Status</span>
            <span className="ml-auto font-medium capitalize">
              {mentorProfile.status?.toLowerCase()}
            </span>
          </div>

          {/* Hours */}
          {typeof mentorProfile.hours === "number" && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">Total hours</span>
              <span className="ml-auto font-medium">{mentorProfile.hours}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Session */}
      <Card className="rounded-2xl border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Next Session</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-16 w-full rounded-xl" />
          ) : nextSession ? (
            <div className="rounded-xl border border-border/50 bg-muted/40 px-3 py-3">
              <p className="line-clamp-2 text-sm font-medium">
                {nextSession.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {nextSession.starts_at
                  ? formatDateTime(nextSession.starts_at)
                  : "—"}
              </p>
              {nextSession.entity_name && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {nextSession.entity_name}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No upcoming sessions scheduled.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
