"use client";

/**
 * Company Testimonials Section
 *
 * 📍 src/features/company-jobs/components/profile/company-testimonials-section.tsx
 *
 * Horizontal-scroll row of muLearn hire testimonials.
 * @mock tracked: #company-testimonials-model
 */

import { Quote } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CompanyTestimonial } from "../../types";

function TestimonialCard({ testimonial }: { testimonial: CompanyTestimonial }) {
  const initials = testimonial.learner_name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex w-72 shrink-0 flex-col gap-4 rounded-xl border border-border bg-muted/30 p-4">
      <Quote className="size-5 text-primary/60" />
      <p className="flex-1 text-sm leading-relaxed text-foreground">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        {testimonial.author_avatar ? (
          <Image
            src={testimonial.author_avatar}
            alt={testimonial.learner_name}
            width={36}
            height={36}
            className="size-9 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary">
            <span className="text-xs font-bold text-primary-foreground">
              {initials}
            </span>
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {testimonial.learner_name}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {testimonial.role}
          </p>
        </div>
      </div>
    </div>
  );
}

interface CompanyTestimonialsSectionProps {
  testimonials: CompanyTestimonial[];
}

export function CompanyTestimonialsSection({
  testimonials,
}: CompanyTestimonialsSectionProps) {
  if (!testimonials.length) return null;

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <Quote className="size-4 text-primary" />
          </div>
          <CardTitle className="text-base font-bold text-foreground">
            From Our Hires
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 pt-0">
        <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {testimonials.map((t) => (
            <TestimonialCard key={t.learner_name} testimonial={t} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
