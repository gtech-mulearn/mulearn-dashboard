"use client";

/**
 * Company Culture Section
 *
 * 📍 src/features/company-jobs/components/profile/company-culture-section.tsx
 *
 * Culture text + perks chips + tech stack chips.
 * All fields currently from MOCK_COMPANY_EXTENDED — remove mock as backend ships them.
 */

import { Code2, Heart, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CompanyCultureSectionProps {
  cultureText?: string | null;
  /** @mock tracked: #company-profile-extended */
  techStack: string[];
  /** @mock tracked: #company-profile-extended */
  perks: string[];
}

export function CompanyCultureSection({
  cultureText,
  techStack,
  perks,
}: CompanyCultureSectionProps) {
  const hasContent = cultureText || techStack.length > 0 || perks.length > 0;
  if (!hasContent) return null;

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <Heart className="size-4 text-primary" />
          </div>
          <CardTitle className="text-base font-bold text-foreground">
            Culture &amp; Stack
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-5 pb-5 pt-0">
        {/* Culture text */}
        {cultureText && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {cultureText}
          </p>
        )}

        {/* Tech Stack */}
        {techStack.length > 0 && (
          <div>
            <div className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Code2 className="size-3.5" />
              Tech Stack
            </div>
            <div className="flex flex-wrap gap-1.5">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Perks */}
        {perks.length > 0 && (
          <div>
            <div className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Layers className="size-3.5" />
              Perks &amp; Benefits
            </div>
            <div className="flex flex-wrap gap-1.5">
              {perks.map((perk) => (
                <span
                  key={perk}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {perk}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
