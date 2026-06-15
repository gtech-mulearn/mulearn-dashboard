/**
 * About Tab
 *
 * 📍 src/features/mentor/profile/components/tabs/about-tab.tsx
 *
 * Displays the mentor's bio (about) and expertise tags.
 * Expertise is stored as a comma-separated string on the backend
 * and split client-side into individual tags.
 */

"use client";

import { FileText, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MentorApplication } from "@/features/mentor/onboarding/schemas";

interface AboutTabProps {
  mentorProfile: MentorApplication;
}

export function AboutTab({ mentorProfile }: AboutTabProps) {
  const about = mentorProfile.about?.trim() || null;
  const expertiseTags = mentorProfile.expertise
    ? mentorProfile.expertise
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="space-y-4">
      {/* Bio */}
      <Card className="rounded-2xl border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Bio
          </CardTitle>
        </CardHeader>
        <CardContent>
          {about ? (
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
              {about}
            </p>
          ) : (
            <div className="flex min-h-[80px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
              No bio added yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expertise Tags */}
      <Card className="rounded-2xl border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Tag className="h-4 w-4 text-muted-foreground" />
            Expertise
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expertiseTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {expertiseTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[60px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
              No expertise tags added yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
