"use client";

/**
 * Company Credibility Section
 *
 * 📍 src/features/company-jobs/components/profile/company-credibility-section.tsx
 *
 * muLearn-powered credibility stats: hires, karma, campus events, member since.
 * hire_count, avg_karma_of_hires, campus_events_count → @mock #company-hire-tracking
 */

import { Award, CalendarDays, GraduationCap, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatItemProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}

function StatItem({ icon, value, label }: StatItemProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl bg-muted/40 p-4 text-center">
      <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
        {icon}
      </div>
      <p className="text-2xl font-black text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

interface CompanyCredibilitySectionProps {
  /** @mock tracked: #company-hire-tracking */
  hireCount: number;
  /** @mock tracked: #company-hire-tracking */
  avgKarmaOfHires: number;
  /** @mock tracked: #company-hire-tracking */
  campusEventsCount: number;
  memberSince?: string;
}

export function CompanyCredibilitySection({
  hireCount,
  avgKarmaOfHires,
  campusEventsCount,
  memberSince,
}: CompanyCredibilitySectionProps) {
  const memberSinceLabel = memberSince
    ? new Date(memberSince).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <Award className="size-4 text-primary" />
          </div>
          <CardTitle className="text-base font-bold text-foreground">
            muLearn Credibility
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 pt-0">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatItem
            icon={<Users className="size-4 text-primary" />}
            value={hireCount}
            label="Hires via muLearn"
          />
          <StatItem
            icon={<GraduationCap className="size-4 text-primary" />}
            value={avgKarmaOfHires.toLocaleString()}
            label="Avg. Hire Karma"
          />
          <StatItem
            icon={<CalendarDays className="size-4 text-primary" />}
            value={campusEventsCount}
            label="Campus Events"
          />
          {memberSinceLabel ? (
            <StatItem
              icon={<Award className="size-4 text-primary" />}
              value={memberSinceLabel}
              label="Member Since"
            />
          ) : (
            <StatItem
              icon={<Award className="size-4 text-primary" />}
              value="—"
              label="Member Since"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
