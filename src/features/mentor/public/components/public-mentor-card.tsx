"use client";

import { Building2, CalendarDays, Clock, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { chipColor } from "@/lib/chip-colors";
import {
  usePublicMentorAvailability,
  usePublicMentorProfile,
} from "../hooks/use-public-mentor";

// Weekday mapping
const DAY_LABELS: Record<number, string> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

function formatTime(t: string): string {
  if (!t) return "";
  const [hStr, mStr] = t.split(":");
  const h = Number(hStr);
  const m = mStr ?? "00";
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m} ${period}`;
}

interface PublicMentorCardProps {
  mentorId: string;
}

export function PublicMentorCard({ mentorId }: PublicMentorCardProps) {
  const { data: profile, isLoading: loadingProfile } =
    usePublicMentorProfile(mentorId);
  const { data: availability, isLoading: loadingAvail } =
    usePublicMentorAvailability(mentorId);

  const isLoading = loadingProfile || loadingAvail;

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl rounded-2xl border-border/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="w-full max-w-2xl rounded-2xl border-border/50">
        <CardContent className="flex flex-col items-center justify-center p-10 text-center text-muted-foreground">
          <Shield className="h-10 w-10 opacity-20 mb-2" />
          <p>Mentor profile not found.</p>
        </CardContent>
      </Card>
    );
  }

  const expertiseTags = profile.expertise
    ? profile.expertise
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <Card className="w-full max-w-3xl rounded-2xl border-border/50 overflow-hidden">
      {/* Header Banner - slight gradient */}
      <div className="h-24 w-full bg-gradient-to-r from-primary/10 via-primary/5 to-background" />

      <CardContent className="px-6 pb-6 pt-0 relative">
        {/* Avatar positioned halfway over the banner */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-6">
          <Avatar className="h-24 w-24 rounded-2xl ring-4 ring-background">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.user_full_name}`}
              alt={profile.user_full_name ?? "Mentor"}
            />
            <AvatarFallback className="text-2xl rounded-2xl font-bold">
              {profile.user_full_name?.charAt(0) ?? "?"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 pb-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {profile.user_full_name}
                </h2>
                {/* MUID is not explicitly in schema right now, using user as fallback string for display */}
                {profile.user && (
                  <p className="text-sm font-medium text-muted-foreground">
                    @{profile.user}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {profile.mentor_tier && (
                  <Badge
                    variant="secondary"
                    className="capitalize px-3 py-1 text-sm"
                  >
                    <Shield className="mr-1.5 h-3.5 w-3.5" />
                    {profile.mentor_tier}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats and Affiliation Row */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-8 text-sm">
          {profile.org && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{profile.org}</span>
            </div>
          )}
          {typeof profile.hours === "number" && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{profile.hours} hrs</span>
            </div>
          )}
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                About
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {profile.about || "No bio provided."}
              </p>
            </section>

            {/* Expertise */}
            {expertiseTags.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {expertiseTags.map((tag) => (
                    <Badge
                      key={tag}
                      className={`font-medium ${chipColor(tag)}`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Preferred IGs */}
            {profile.preferred_ig_ids &&
              profile.preferred_ig_ids.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Focus Areas (IGs)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferred_ig_ids.map((ig) => (
                      <Badge
                        key={ig}
                        variant="secondary"
                        className="font-medium"
                      >
                        {ig}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}
          </div>

          {/* Availability Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <section className="rounded-xl border border-border/50 bg-muted/20 p-4">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Weekly Availability</h3>
              </div>

              {!availability || availability.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No availability slots listed.
                </p>
              ) : (
                <ul className="space-y-3">
                  {availability.map((slot) => (
                    <li
                      key={slot.id}
                      className="text-sm flex justify-between items-center border-b border-border/30 pb-2 last:border-0 last:pb-0"
                    >
                      <span className="font-medium text-foreground/80">
                        {DAY_LABELS[slot.weekday] ?? `Day ${slot.weekday}`}
                      </span>
                      <span className="text-muted-foreground text-xs bg-background border px-2 py-1 rounded-md">
                        {formatTime(slot.start_time)} -{" "}
                        {formatTime(slot.end_time)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
